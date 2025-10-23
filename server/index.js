import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Dev CORS (ok to remove if serving frontend+API from same App Service origin)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

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

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign({ id: user.Id, username: user.Username }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const bearer = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  const token = req.cookies?.auth || bearer;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

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
		const token = signToken({ Id: user.Id, Username: user.Username });
		res.cookie('auth', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000
		});
		res.json({ message: 'ok', user: { id: user.Id, username: user.Username } });
	} catch (err) {
		console.error('Login error:', err);
		return res.status(500).json({ error: 'server error' });
	}
});

// Add logout route
app.post('/api/logout', requireAuth, (req, res) => {
  res.clearCookie('auth', { path: '/' });
  res.json({ message: 'logged_out' });
});

// List favorites for a user: GET /api/favorites?userId=123
app.get('/api/favorites', requireAuth, async (req, res) => {
	try {
		await poolConnect;
		const result = await pool.request()
			.input('uid', sql.Int, req.user.id)
			.query('SELECT ItemId, ItemName, CreatedAt FROM dbo.Favorites WHERE UserId=@uid ORDER BY CreatedAt DESC');
		res.json(result.recordset);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to load favorites' });
	}
});

app.post('/api/favorites', requireAuth, async (req, res) => {
  const { itemId, itemName } = req.body || {};
  if (!itemId) return res.status(400).json({ error: 'itemId required' });
  try {
    await poolConnect;
    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .input('iid', sql.NVarChar(100), itemId)
      .input('name', sql.NVarChar(255), itemName || null)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Favorites WHERE UserId=@uid AND ItemId=@iid)
          INSERT INTO dbo.Favorites (UserId, ItemId, ItemName) VALUES (@uid, @iid, @name);
        SELECT ItemId, ItemName FROM dbo.Favorites WHERE UserId=@uid AND ItemId=@iid;
      `);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites', requireAuth, async (req, res) => {
  const { itemId } = req.body || {};
  if (!itemId) return res.status(400).json({ error: 'itemId required' });
  try {
    await poolConnect;
    await pool.request()
      .input('uid', sql.Int, req.user.id)
      .input('iid', sql.NVarChar(100), itemId)
      .query('DELETE FROM dbo.Favorites WHERE UserId=@uid AND ItemId=@iid;');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

