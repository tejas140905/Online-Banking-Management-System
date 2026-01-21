# Online Banking Management System (React + Express + MySQL)

Production-style starter kit demonstrating secure digital banking workflows with user/admin roles, JWT auth, MySQL transactions, and Tailwind UI.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind. Pages for public marketing, customer dashboards, transfers, history, profile, and admin console.
- **Backend**: Express 4, modular routes/controllers/services. JWT auth, bcrypt hashing, request validation, role guard, and MySQL transactions for fund moves.
- **Database**: MySQL with normalized tables: `users`, `accounts`, `transactions`, `admin_logs`.

## Project structure
```
backend/
  src/
    config/db.js
    middleware/
    controllers/
    routes/
    utils/
  schema.sql
  env.example
frontend/
  src/
    pages/, components/, api/
  tailwind.config.js, vite.config.js
```

## Prerequisites
- Node.js 18+
- MySQL 8+

## Database setup
1) Create DB and tables, plus seed admin:
   ```sql
   mysql -u root -p < backend/schema.sql
   ```
2) Update admin password if desired (bcrypt hash in `schema.sql` is `Admin@123`).

## Backend setup
```bash
cd "C:\Users\tejas\Desktop\New Project\backend"
npm install
copy env.example .env   # or set real env vars
npm run dev             # starts on http://localhost:4000
```

## Frontend setup
```bash
cd "C:\Users\tejas\Desktop\New Project\frontend"
npm install
npm run dev             # Vite on http://localhost:5173
```
Set `VITE_API_URL` in `frontend/.env` if backend runs elsewhere.

## Key API routes
- `POST /api/auth/register` – creates user (PENDING) + account number
- `POST /api/auth/login` – JWT login (ACTIVE only)
- `GET /api/user/profile` – user profile + accounts
- `PUT /api/user/profile` – update name
- `GET /api/accounts` – list user accounts
- `POST /api/accounts/transfer` – atomic debit/credit, prevents self-transfer
- `GET /api/accounts/transactions` – user transactions
- `GET /api/admin/users/pending` – list pending
- `POST /api/admin/users/:id/approve|block|unblock`
- `GET /api/admin/accounts` – all accounts
- `GET /api/admin/transactions` – monitor
- `GET /api/admin/stats` – totals

## Security notes
- Passwords hashed with bcrypt, JWT-based auth, role-based middleware.
- SQL transactions wrap transfers to avoid partial updates.
- Helmet, CORS, and input validation added; extend with rate limits & audit logs for production.

## Suggested free deployment
- Backend: Render free tier (Node + MySQL external) or Railway.
- DB: PlanetScale free tier (MySQL-compatible) or Azure MySQL dev.
- Frontend: Vercel/Netlify pointing to backend API URL.

## Next improvements
- Add refresh tokens + logout-all-sessions.
- Add pagination and filters for transactions.
- Add audit logging for admin actions and rate limiting for auth routes.
