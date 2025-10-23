import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(express.json());

// CORS: allow local dev frontend by default or use env
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) || ['http://localhost:5173'];
app.use(cors({ origin: corsOrigins, credentials: false }));

// Azure SQL config
const sqlConfig = {
	server: process.env.AZURE_SQL_SERVER, // e.g. myserver.database.windows.net
	database: process.env.AZURE_SQL_DATABASE,
	user: process.env.AZURE_SQL_USER,
	password: process.env.AZURE_SQL_PASSWORD,
	port: 1433,
	options: { encrypt: true, trustServerCertificate: false }
};

if (!sqlConfig.server || !sqlConfig.database || !sqlConfig.user || !sqlConfig.password) {
	console.warn('Warning: Missing Azure SQL env variables. Set AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USER, AZURE_SQL_PASSWORD');
}

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect().then(() => console.log('Connected to Azure SQL')).catch(err => {
	console.error('Failed to connect to Azure SQL:', err.message);
});

// Ensure table exists (idempotent). For production, manage schema via migrations.
async function ensureSchema() {
	try {
		await poolConnect;
		const rq = pool.request();
		// Create table if it doesn't exist
		await rq.query(`IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
		BEGIN
			CREATE TABLE [dbo].[Users] (
				[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
				[Username] NVARCHAR(100) NOT NULL UNIQUE,
				[Email] NVARCHAR(255) NULL,
				[PasswordHash] NVARCHAR(255) NOT NULL,
				[CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
			);
		END`);

		// Add Email column if missing
		await rq.query(`IF COL_LENGTH('dbo.Users','Email') IS NULL
			ALTER TABLE dbo.Users ADD Email NVARCHAR(255) NULL;`);

		// Add PasswordHash column if missing (nullable to support legacy rows)
		await rq.query(`IF COL_LENGTH('dbo.Users','PasswordHash') IS NULL
			ALTER TABLE dbo.Users ADD PasswordHash NVARCHAR(255) NULL;`);

		// Ensure a unique index on Username if not already present
		await rq.query(`IF NOT EXISTS (
				SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('dbo.Users')
			)
			BEGIN
				BEGIN TRY
					CREATE UNIQUE INDEX IX_Users_Username ON dbo.Users(Username);
				END TRY
				BEGIN CATCH
					-- Ignore if duplicates exist; app will still function
				END CATCH
			END`);

		console.log('Schema verified/updated.');
			// Create Favorites table if missing
			await rq.query(`IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Favorites]') AND type in (N'U'))
			BEGIN
				CREATE TABLE [dbo].[Favorites] (
					[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
					[UserId] INT NOT NULL,
					[ItemId] NVARCHAR(100) NOT NULL,
					[ItemName] NVARCHAR(255) NULL,
					[CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
					CONSTRAINT FK_Favorites_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
				);
			END`);

			// Unique composite index to prevent duplicate favorites per user
			await rq.query(`IF NOT EXISTS (
					SELECT 1 FROM sys.indexes WHERE name = 'IX_Favorites_User_Item' AND object_id = OBJECT_ID('dbo.Favorites')
				)
				CREATE UNIQUE INDEX IX_Favorites_User_Item ON dbo.Favorites(UserId, ItemId);`);

			console.log('Favorites schema verified/updated.');
	} catch (err) {
		console.error('Schema ensure error:', err.message);
	}
}
ensureSchema();

app.get('/health', (req, res) => {
	res.json({ ok: true, time: new Date().toISOString() });
});

// Register: { username, email, password }
app.post('/api/register', async (req, res) => {
	const { username, email, password } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
	try {
		await poolConnect;
		const existing = await pool.request()
			.input('username', sql.NVarChar(100), username)
			.query('SELECT 1 FROM dbo.Users WHERE Username = @username');
		if (existing.recordset.length > 0) {
			return res.status(409).json({ error: 'username already exists' });
		}

		const hash = await bcrypt.hash(password, 10);
		await pool.request()
			.input('username', sql.NVarChar(100), username)
			.input('email', sql.NVarChar(255), email || null)
			.input('hash', sql.NVarChar(255), hash)
			.query('INSERT INTO dbo.Users (Username, Email, PasswordHash) VALUES (@username, @email, @hash)');
		return res.status(201).json({ message: 'registered' });
	} catch (err) {
		console.error('Register error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// Login: { username, password }
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
	try {
		await poolConnect;
		const result = await pool.request()
			.input('username', sql.NVarChar(100), username)
			.query('SELECT Id, Username, PasswordHash FROM dbo.Users WHERE Username = @username');
		if (result.recordset.length === 0) {
			return res.status(401).json({ error: 'invalid credentials' });
		}
		const user = result.recordset[0];
		const ok = await bcrypt.compare(password, user.PasswordHash);
		if (!ok) return res.status(401).json({ error: 'invalid credentials' });
		// For simplicity, return a basic success. In production, return a JWT.
		return res.json({ message: 'ok', user: { id: user.Id, username: user.Username } });
	} catch (err) {
		console.error('Login error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// List favorites for a user: GET /api/favorites?userId=123
app.get('/api/favorites', async (req, res) => {
	const userId = parseInt(req.query.userId, 10);
	if (!userId) return res.status(400).json({ error: 'userId is required' });
	try {
		await poolConnect;
		const result = await pool.request()
			.input('userId', sql.Int, userId)
			.query('SELECT ItemId, ItemName, CreatedAt FROM dbo.Favorites WHERE UserId = @userId ORDER BY CreatedAt DESC');
		return res.json(result.recordset);
	} catch (err) {
		console.error('Favorites list error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// Add a favorite: POST /api/favorites { userId, itemId, itemName? }
app.post('/api/favorites', async (req, res) => {
	const { userId, itemId, itemName } = req.body || {};
	if (!userId || !itemId) return res.status(400).json({ error: 'userId and itemId are required' });
	try {
		await poolConnect;
		// Ensure user exists
		const u = await pool.request().input('uid', sql.Int, userId).query('SELECT 1 FROM dbo.Users WHERE Id = @uid');
		if (u.recordset.length === 0) return res.status(404).json({ error: 'user not found' });

		// Upsert-like insert ignoring duplicates
		await pool.request()
			.input('uid', sql.Int, userId)
			.input('iid', sql.NVarChar(100), itemId)
			.input('iname', sql.NVarChar(255), itemName || null)
			.query(`IF NOT EXISTS (SELECT 1 FROM dbo.Favorites WHERE UserId = @uid AND ItemId = @iid)
							INSERT INTO dbo.Favorites (UserId, ItemId, ItemName) VALUES (@uid, @iid, @iname);`);
		return res.status(201).json({ message: 'favorited' });
	} catch (err) {
		console.error('Favorites add error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// Remove a favorite: DELETE /api/favorites { userId, itemId }
app.delete('/api/favorites', async (req, res) => {
	const { userId, itemId } = req.body || {};
	if (!userId || !itemId) return res.status(400).json({ error: 'userId and itemId are required' });
	try {
		await poolConnect;
		const r = await pool.request()
			.input('uid', sql.Int, userId)
			.input('iid', sql.NVarChar(100), itemId)
			.query('DELETE FROM dbo.Favorites WHERE UserId = @uid AND ItemId = @iid');
		if (r.rowsAffected?.[0] === 0) return res.status(404).json({ error: 'favorite not found' });
		return res.json({ message: 'unfavorited' });
	} catch (err) {
		console.error('Favorites delete error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

