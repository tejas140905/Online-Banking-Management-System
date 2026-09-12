# Online Banking Management System

Secure digital banking app with customer and admin workflows, built on a REST API with JWT authentication and atomic MySQL fund transfers.

## Overview

Customers register, get approved by an admin, then sign in to view accounts, transfer funds, and review transaction history. Admins approve users, monitor accounts and transfers, and view platform statistics. The React frontend talks to an Express REST API over JSON, with all data validated server-side and persisted in MySQL.

## Key Features

### Customer

* Registration (pending admin approval)
* JWT authentication with refresh-token rotation
* Dashboard with all accounts, balances, and active-account switching
* Open additional named accounts (Savings, Current, ...)
* Fund transfer with server-side validation (self transfer between own accounts, or external)
* Transaction history with pagination and filters
* Profile management and password change

### Admin

* Pending-user approvals (approve / block / unblock) with audit logging
* Account monitoring
* Transaction monitoring
* Audit-log viewer
* Platform statistics

## Tech Stack

Frontend: React, Vite, Tailwind CSS, JavaScript, Axios, React Router
Backend: Node.js, Express.js, REST API
Database: MySQL (mysql2, parameterized queries, transactions)
Security: JWT + rotating refresh tokens, bcrypt, role-based authorization, Helmet, auth rate limiting, input validation (express-validator)
Testing: Playwright (E2E), Node built-in test runner (API), Postman collection
DevOps: Docker Compose, GitHub Actions CI
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
Login form → POST /api/auth/login → bcrypt check → JWT + refresh token
→ access token in Authorization header → silent rotation via /api/auth/refresh
→ logout revokes refresh token → protected routes → dashboard
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
| POST | `/api/auth/login` | No | JWT login + refresh token (ACTIVE users only) |
| POST | `/api/auth/refresh` | No | Rotate refresh token → new JWT pair |
| POST | `/api/auth/logout` | No | Revoke refresh token |
| GET | `/api/user/profile` | User | Profile + accounts |
| PUT | `/api/user/profile` | User | Update name |
| PUT | `/api/user/password` | User | Change password (revokes other sessions) |
| GET | `/api/accounts` | User | List own accounts (with labels) |
| POST | `/api/accounts` | User | Open an additional named account |
| POST | `/api/accounts/transfer` | User | Atomic fund transfer |
| GET | `/api/accounts/transactions` | User | History + filters (`account,type,status,from,to`) + pagination (`page,limit`) |
| GET | `/api/admin/users/pending` | Admin | Pending approvals |
| POST | `/api/admin/users/:userId/approve` | Admin | Approve user |
| POST | `/api/admin/users/:userId/block` | Admin | Block user |
| POST | `/api/admin/users/:userId/unblock` | Admin | Unblock user |
| GET | `/api/admin/accounts` | Admin | All accounts |
| GET | `/api/admin/transactions` | Admin | Recent transactions |
| GET | `/api/admin/stats` | Admin | Totals |
| GET | `/api/admin/logs` | Admin | Audit log of admin actions |

## Database

Tables: `users`, `accounts`, `transactions`, `admin_logs`, `refresh_tokens` (see `backend/schema.sql`; existing DBs: apply `backend/migrations/002_refresh_tokens.sql`).

* `users` → `accounts`: one-to-many (`accounts.user_id` → `users.id`, cascade delete).
* Transfers move balances between `accounts` rows and append `transactions` records.
* Seed admin: `admin@bank.com` / `Admin@123` (change after import).

## Security

* Passwords hashed with bcrypt; never returned by the API.
* Short-lived JWT access tokens + rotating opaque refresh tokens (SHA-256 hashed at rest, revoked on logout/password change).
* Rate limiting on auth endpoints (`AUTH_RATE_LIMIT_MAX` per 15 min).
* JWT auth middleware + role-based (`USER` / `ADMIN`) authorization.
* Parameterized SQL everywhere; transfer wrapped in `BEGIN` / `COMMIT` / `ROLLBACK` with `SELECT ... FOR UPDATE` row locks.
* express-validator on register, login, transfer, and profile update.
* Helmet headers; CORS restricted to `FRONTEND_URL`.
* Secrets in `backend/.env` (git-ignored); template in `backend/.env.example`.

## Testing

* E2E: `frontend/tests/e2e/` (Playwright) — login form, invalid-credential error, dashboard auth guard, logout, transfer API guard; live login/transfer/history tests run when `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` point at a seeded ACTIVE user.
* API: `backend/tests/api.test.js` (`npm run test:api`, no extra deps) — health, validation 400s, 401 guards, wrong-credential login.
* Postman: `backend/postman/online-banking.postman_collection.json` (login auto-saves `{{token}}` + `{{refreshToken}}`).

## Enterprise Operations

* Every approve/block/unblock is written to `admin_logs` and viewable at `GET /api/admin/logs`.
* Transaction history supports statement-style filters and pagination (`?account=&type=&status=&from=&to=&page=&limit=`).
* Health endpoint reports DB status: `GET /api/health` → `{ status, uptime, db, version }`.
* Password changes revoke all other sessions, forcing re-login.
* Docker: `docker compose up --build` starts MySQL (auto-seeded from `schema.sql`), backend (:4000), and frontend (:8080). Override with `DB_PASSWORD` / `JWT_SECRET` env vars.
* CI: `.github/workflows/ci.yml` runs API tests against MySQL 8 and the frontend production build on every push/PR.

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

Demo profiles (multi-account showcase): `cd backend && npm run seed:demo` creates ACTIVE logins `aarav.demo@credx.bank` / `Diya Patel` (password `Demo@123`) — Aarav owns Savings + Current accounts for switching and self-transfer demos. Safe to re-run (skips existing).

## Environment Variables

Backend (`backend/.env`, see `backend/.env.example`): `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_EXPIRES_DAYS`, `AUTH_RATE_LIMIT_MAX`, `FRONTEND_URL`.
Frontend (`frontend/.env`, see `frontend/.env.example`): `VITE_API_URL` (defaults to `http://localhost:4000/api`).

## Key Engineering Highlights

* RESTful API architecture with JSON request/response contracts.
* JWT authentication with rotating refresh tokens and role-based authorization.
* Auth rate limiting and server-side validation for registration, login, and transfers.
* Atomic database transactions (`BEGIN` → row locks → debit/credit → `COMMIT`, `ROLLBACK` on failure).
* Admin audit logging for compliance-style traceability.
* Paginated, filterable statements for transaction history.
* Structured error handling with consistent JSON errors and safe status codes.
* Browser automation testing via Playwright against stable DOM selectors.
* API regression tests plus a Postman collection for manual verification.
* MySQL data management with parameterized queries and relational integrity.
* Dockerized deployment and CI pipeline (build + API tests on every push).

## Future Improvements

* Refresh tokens and login rate limiting.
* Pagination/filters for transaction lists.
* Admin audit-log writes on approve/block actions.
