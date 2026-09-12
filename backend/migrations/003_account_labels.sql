-- Enterprise upgrade: named accounts (Savings/Current/...) for multi-account users.
-- Apply to an existing database with:
--   node backend/apply-migration-tmp.js (uses backend/.env credentials)
USE banking_app;

ALTER TABLE accounts ADD COLUMN label VARCHAR(40) NULL DEFAULT NULL;
