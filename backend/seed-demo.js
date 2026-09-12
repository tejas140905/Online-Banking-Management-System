// Demo profiles for interviews and walkthroughs. Idempotent: existing
// emails are skipped, so it is safe to run multiple times.
// Run: `npm run seed:demo` (backend/.env must point at MySQL).
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const DEMOS = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.demo@credx.bank',
    accounts: [
      { label: 'Savings', balance: 120000 },
      { label: 'Current', balance: 80000 },
    ],
  },
  {
    name: 'Diya Patel',
    email: 'diya.demo@credx.bank',
    accounts: [{ label: 'Savings', balance: 95000 }],
  },
];

const accNo = () => crypto.randomInt(100000000000, 999999999999).toString();

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
  const hash = await bcrypt.hash('Demo@123', 10);
  for (const d of DEMOS) {
    const [existing] = await c.query('SELECT id FROM users WHERE email = ?', [d.email]);
    let userId;
    if (existing.length) {
      userId = existing[0].id;
      console.log('SKIP user ' + d.email);
    } else {
      const [r] = await c.query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'USER', 'ACTIVE')",
        [d.name, d.email, hash]
      );
      userId = r.insertId;
      console.log('CREATE user ' + d.email + ' (password Demo@123)');
    }
    for (const a of d.accounts) {
      const [acc] = await c.query(
        'SELECT account_number FROM accounts WHERE user_id = ? AND label = ?',
        [userId, a.label]
      );
      if (acc.length) {
        console.log('SKIP account ' + d.email + ' / ' + a.label);
        continue;
      }
      const n = accNo();
      await c.query(
        'INSERT INTO accounts (user_id, account_number, label, balance) VALUES (?, ?, ?, ?)',
        [userId, n, a.label, a.balance]
      );
      await c.query(
        "INSERT INTO transactions (from_account, to_account, amount, type, status) VALUES ('CREDX-BANK', ?, ?, 'CREDIT', 'SUCCESS')",
        [n, a.balance]
      );
      console.log('CREATE account ' + n + ' (' + a.label + ') bal=' + a.balance);
    }
  }
  await c.end();
})().catch((e) => {
  console.log('SEED_FAIL:' + (e.code || e.message));
  process.exit(1);
});
