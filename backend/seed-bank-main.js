// One-time bank setup: the admin's single "Bank Main" treasury account.
// Idempotent: safe to re-run (never duplicates, never overwrites).
// Run: `node backend/seed-bank-main.js` (uses backend/.env credentials).
require('dotenv').config();
const mysql = require('mysql2/promise');

const BANK_MAIN_NUMBER = '100000000001';
const BANK_MAIN_BALANCE = 500000000;

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
  const [[admin]] = await c.query("SELECT id FROM users WHERE email = 'admin@bank.com'");
  if (!admin) throw new Error('admin user missing');
  const [existing] = await c.query('SELECT account_number, balance FROM accounts WHERE user_id = ? AND label = ?', [
    admin.id,
    'Bank Main',
  ]);
  if (existing.length) {
    console.log('EXISTS ' + existing[0].account_number + ' bal=' + existing[0].balance);
  } else {
    await c.query('INSERT INTO accounts (user_id, account_number, label, balance) VALUES (?, ?, ?, ?)', [
      admin.id,
      BANK_MAIN_NUMBER,
      'Bank Main',
      BANK_MAIN_BALANCE,
    ]);
    await c.query(
      "INSERT INTO transactions (from_account, to_account, amount, type, status) VALUES ('CREDX-BANK', ?, ?, 'CREDIT', 'SUCCESS')",
      [BANK_MAIN_NUMBER, BANK_MAIN_BALANCE]
    );
    console.log('CREATE Bank Main ' + BANK_MAIN_NUMBER + ' bal=' + BANK_MAIN_BALANCE);
  }
  // Remove leftover zero-balance test accounts so the admin holds exactly one account.
  const [stray] = await c.query(
    "SELECT account_number FROM accounts WHERE user_id = ? AND label <> 'Bank Main' AND balance = 0",
    [admin.id]
  );
  for (const s of stray) {
    const [[used]] = await c.query(
      'SELECT COUNT(*) AS n FROM transactions WHERE from_account = ? OR to_account = ?',
      [s.account_number, s.account_number]
    );
    if (Number(used.n) === 0) {
      await c.query('DELETE FROM accounts WHERE account_number = ?', [s.account_number]);
      console.log('REMOVE stray ' + s.account_number);
    } else {
      console.log('KEEP (has history) ' + s.account_number);
    }
  }
  await c.end();
})().catch((e) => {
  console.log('SEED_FAIL:' + (e.code || e.message));
  process.exit(1);
});
