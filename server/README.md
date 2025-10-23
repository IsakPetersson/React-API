API server for Azure SQL-backed auth

Local setup
- Copy .env.example to .env and fill values
- Install deps: npm install
- Start dev: npm run dev (defaults to http://localhost:3001)

Env vars
- AZURE_SQL_SERVER
- AZURE_SQL_DATABASE
- AZURE_SQL_USER
- AZURE_SQL_PASSWORD
- CORS_ORIGIN (comma-separated list)
- PORT

Endpoints
- POST /api/register { username, email?, password }
- POST /api/login { username, password }

Notes
- Passwords are hashed with bcrypt.
- For production, prefer Managed Identity and Azure AD auth for SQL.
