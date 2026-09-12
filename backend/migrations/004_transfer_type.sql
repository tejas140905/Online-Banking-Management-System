-- Single-row transfers: one record per money movement (type TRANSFER).
-- Apply: node backend/apply-004-tmp.js (uses backend/.env credentials).
USE banking_app;

ALTER TABLE transactions MODIFY COLUMN type ENUM('CREDIT', 'DEBIT', 'TRANSFER') NOT NULL;
