require('dotenv').config();
const mysql = require('mysql2/promise');
const BASE = 'http://localhost:4000/api';
const J = (r) => r.json();
const check = (n, c) => {
  console.log((c ? 'PASS' : 'FAIL') + ' ' + n);
  if (!c) process.exitCode = 1;
};
const EMAIL = 'tmp.verify@credx.bank';
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, port: process.env.DB_PORT || 3306,
  });
  // 1. Register + approve (real flow).
  await fetch(BASE + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tmp Verify', email: EMAIL, password: 'Tmp@12345' }),
  });
  const adm = await J(await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bank.com', password: 'Admin@123' }),
  }));
  const AH = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adm.token };
  const [[tmp]] = await db.query('SELECT id FROM users WHERE email = ?', [EMAIL]);
  await fetch(BASE + `/admin/users/${tmp.id}/approve`, { method: 'POST', headers: AH });
  const usr = await J(await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'Tmp@123' }),
  }));
  const UH = { 'Content-Type': 'application/json', Authorization: `Bearer ${usr.token}` };
  // 2. Two accounts + owner funding from Bank Main.
  const mk = async (label) => (await J(await fetch(BASE + '/accounts', {
    method: 'POST', headers: UH, body: JSON.stringify({ label }),
  }))).accountNumber;
  const S = await mk('TmpSave');
  const C = await mk('TmpCur');
  await fetch(BASE + '/accounts/transfer', {
    method: 'POST', headers: AH,
    body: JSON.stringify({ fromAccount: '100000000001', toAccount: S, amount: 1000 }),
  });
  // 3. Self-transfer: exactly one TRANSFER row with resolved names.
  const before = await J(await fetch(BASE + '/accounts/transactions?limit=100', { headers: UH }));
  await fetch(BASE + '/accounts/transfer', {
    method: 'POST', headers: UH,
    body: JSON.stringify({ fromAccount: S, toAccount: C, amount: 100 }),
  });
  const after = await J(await fetch(BASE + '/accounts/transactions?limit=100', { headers: UH }));
  check('exactly one new row', after.transactions.length - before.transactions.length === 1);
  const row = after.transactions[0];
  check('single TRANSFER row', row.type === 'TRANSFER' && Number(row.amount) === 100);
  check('names resolved', row.from_name === 'Tmp Verify' && row.to_name === 'Tmp Verify');
  // 4. Admin monitor shows the same single row with names.
  const mon = await J(await fetch(BASE + '/admin/transactions', { headers: AH }));
  const seen = mon.transactions.filter((t) => t.from_account === S && t.to_account === C);
  check('admin monitor single row + names', seen.length === 1 && seen[0].from_name === 'Tmp Verify');
  // 5. Full cleanup: txns, accounts, user (audit rows cascade).
  await db.query('DELETE FROM transactions WHERE from_account IN (?,?) OR to_account IN (?,?)', [S, C, S, C]);
  await db.query('DELETE FROM accounts WHERE account_number IN (?,?)', [S, C]);
  await db.query('DELETE FROM users WHERE email = ?', [EMAIL]);
  const [[left]] = await db.query('SELECT COUNT(*) AS n FROM users WHERE email = ?', [EMAIL]);
  check('zero residue', left.n === 0);
  // Restore Bank Main funding leg balance effect: admin sent 1000 out; send back via SQL-neutral path:
  // Tmp accounts are gone, so credit Bank Main directly to keep treasury exact.
  await db.query("UPDATE accounts SET balance = balance + 1000 WHERE account_number = '100000000001'");
  await db.query(
    "INSERT INTO transactions (from_account, to_account, amount, type, status) VALUES ('CREDX-BANK', '100000000001', 1000, 'CREDIT', 'SUCCESS')"
  );
  const [[bm]] = await db.query("SELECT balance FROM accounts WHERE account_number = '100000000001'");
  check('bank main restored', Number(bm.balance) === 30000000);
  await db.end();
})().catch((e) => {
  console.log('FAIL ' + (e.code || e.message));
  process.exitCode = 1;
});
