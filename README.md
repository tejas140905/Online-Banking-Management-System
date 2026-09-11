# Online Banking Management System

Secure digital banking app with customer and admin workflows, built on a REST API with JWT authentication and atomic MySQL fund transfers.

## Overview

Customers register, get approved by an admin, then sign in to view accounts, transfer funds, and review transaction history. Admins approve users, monitor accounts and transfers, and view platform statistics. The React frontend talks to an Express REST API over JSON, with all data validated server-side and persisted in MySQL.

## Key Features

### Customer

* Registration (pending admin approval)
* JWT authentication
* Dashboard with balances
* Account management
* Fund transfer with server-side validation
* Transaction history
* Profile management

### Admin

* Pending-user approvals (approve / block / unblock)
* Account monitoring
* Transaction monitoring
* Platform statistics

## Tech Stack

Frontend: React, Vite, Tailwind CSS, JavaScript, Axios, React Router
Backend: Node.js, Express.js, REST API
Database: MySQL (mysql2, parameterized queries, transactions)
Security: JWT, bcrypt, role-based authorization, Helmet, input validation (express-validator)
Testing: Playwright (E2E), Node built-in test runner (API), Postman collection
Tools: Git, GitHub, Chrome DevTools, Postman

## Architecture

```text
React Frontend
      ↓  JSON over REST
Express Backend (routes → controllers → MySQL)
      ↓  SQL
   MySQL
```

## Authentication Flow

```text
Login form → POST /api/auth/login → bcrypt check → JWT issued
→ token in Authorization header → protected routes → dashboard
```

## Fund Transfer Flow

```text
React form → client check → POST /api/accounts/transfer
→ auth + validation → MySQL BEGIN → lock sender → check balance
→ lock receiver → debit + credit → insert transaction records
→ COMMIT (or ROLLBACK on any failure) → JSON response → UI update
```

## API Endpoints

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register customer (PENDING) + account number |
| POST | `/api/auth/login` | No | JWT login (ACTIVE users only) |
| GET | `/api/user/profile` | User | Profile + accounts |
| PUT | `/api/user/profile` | User | Update name |
| GET | `/api/accounts` | User | List own accounts |
| POST | `/api/accounts/transfer` | User | Atomic fund transfer |
| GET | `/api/accounts/transactions` | User | Own transaction history |
| GET | `/api/admin/users/pending` | Admin | Pending approvals |
| POST | `/api/admin/users/:userId/approve` | Admin | Approve user |
| POST | `/api/admin/users/:userId/block` | Admin | Block user |
| POST | `/api/admin/users/:userId/unblock` | Admin | Unblock user |
| GET | `/api/admin/accounts` | Admin | All accounts |
| GET | `/api/admin/transactions` | Admin | Recent transactions |
| GET | `/api/admin/stats` | Admin | Totals |

## Database

Tables: `users`, `accounts`, `transactions`, `admin_logs` (see `backend/schema.sql`).

* `users` → `accounts`: one-to-many (`accounts.user_id` → `users.id`, cascade delete).
* Transfers move balances between `accounts` rows and append `transactions` records.
* Seed admin: `admin@bank.com` / `Admin@123` (change after import).

## Security

* Passwords hashed with bcrypt; never returned by the API.
* JWT auth middleware + role-based (`USER` / `ADMIN`) authorization.
* Parameterized SQL everywhere; transfer wrapped in `BEGIN` / `COMMIT` / `ROLLBACK` with `SELECT ... FOR UPDATE` row locks.
* express-validator on register, login, transfer, and profile update.
* Helmet headers; CORS restricted to `FRONTEND_URL`.
* Secrets in `backend/.env` (git-ignored); template in `backend/.env.example`.

## Testing

* E2E: `frontend/tests/e2e/` (Playwright) — login form, invalid-credential error, dashboard auth guard, logout, transfer API guard; live login/transfer/history tests run when `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` point at a seeded ACTIVE user.
* API: `backend/tests/api.test.js` (`npm run test:api`, no extra deps) — health, validation 400s, 401 guards, wrong-credential login.
* Postman: `backend/postman/online-banking.postman_collection.json` (login auto-saves `{{token}}`).

## Browser Automation & QA

Key UI elements carry stable `data-testid` selectors (`login-email`, `login-password`, `login-submit`, `register-*`, `transfer-from/to/amount/submit`, `transactions-table`, `logout-button`, `admin-*`, `approve-user-*`) so Playwright/CSS/XPath locators survive styling changes and support automated regression testing.

## Debugging with Chrome DevTools

* Elements: inspect DOM and verify `data-testid` selectors.
* Console: debug JavaScript errors from the React app.
* Network: inspect REST requests/responses as JSON (`/api/auth/login`, `/api/accounts/transfer`).
* Application: inspect Local Storage for `token`/`user` auth state.

## Installation

Prerequisites: Node.js 18+, MySQL 8+.

```bash
# 1. Database
mysql -u root -p < backend/schema.sql

# 2. Backend
cd backend
npm install
copy .env.example .env   # Windows; on macOS/Linux: cp .env.example .env
# edit .env with your DB credentials + JWT secret
npm run dev              # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Demo: register a customer → sign in as `admin@bank.com` / `Admin@123` → approve the user → sign in as the customer.

## Environment Variables

Backend (`backend/.env`, see `backend/.env.example`): `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`.
Frontend (`frontend/.env`, see `frontend/.env.example`): `VITE_API_URL` (defaults to `http://localhost:4000/api`).

## Key Engineering Highlights

* RESTful API architecture with JSON request/response contracts.
* JWT authentication with role-based authorization.
* Server-side validation for registration, login, and transfers (rejects invalid, zero/negative, self-transfer, unknown-account, and insufficient-balance cases).
* Atomic database transactions (`BEGIN` → row locks → debit/credit → `COMMIT`, `ROLLBACK` on failure).
* Structured error handling with consistent JSON errors and safe status codes.
* Browser automation testing via Playwright against stable DOM selectors.
* API regression tests plus a Postman collection for manual verification.
* MySQL data management with parameterized queries and relational integrity.

## Future Improvements

* Refresh tokens and login rate limiting.
* Pagination/filters for transaction lists.
* Admin audit-log writes on approve/block actions.
