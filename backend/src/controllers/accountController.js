const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { audit } = require("../utils/audit");

const getAccounts = async (req, res, next) => {
  try {
    const [accounts] = await pool.query(
      "SELECT account_number, balance FROM accounts WHERE user_id = ?",
      [req.user.id],
    );
    return res.json({ accounts });
  } catch (err) {
    return next(err);
  }
};

const transferFunds = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fromAccount, toAccount, amount: rawAmount } = req.body;
  // Normalize amount: express-validator ensures gt 0, but coerce string->number
  // so balance math and MySQL params are strictly numeric.
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }
  if (fromAccount === toAccount) {
    return res.status(400).json({ message: "Cannot transfer to the same account" });
  }

  // Atomic money movement: BEGIN -> lock sender (FOR UPDATE) -> validate ->
  // lock receiver -> debit -> credit -> write txn records -> COMMIT.
  // Any failure triggers ROLLBACK so balances can never partially update.
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [fromRows] = await connection.query(
      "SELECT account_number, balance FROM accounts WHERE account_number = ? AND user_id = ? FOR UPDATE",
      [fromAccount, req.user.id],
    );
    if (!fromRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Source account not found" });
    }
    const fromBal = Number(fromRows[0].balance);
    if (fromBal < amount) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const [toRows] = await connection.query(
      "SELECT account_number FROM accounts WHERE account_number = ? FOR UPDATE",
      [toAccount],
    );
    if (!toRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Destination account not found" });
    }

    await connection.query(
      "UPDATE accounts SET balance = balance - ? WHERE account_number = ?",
      [amount, fromAccount],
    );
    await connection.query(
      "UPDATE accounts SET balance = balance + ? WHERE account_number = ?",
      [amount, toAccount],
    );

    await connection.query(
      "INSERT INTO transactions (from_account, to_account, amount, type, status) VALUES (?, ?, ?, 'DEBIT', 'SUCCESS')",
      [fromAccount, toAccount, amount],
    );
    await connection.query(
      "INSERT INTO transactions (from_account, to_account, amount, type, status) VALUES (?, ?, ?, 'CREDIT', 'SUCCESS')",
      [fromAccount, toAccount, amount],
    );

    await connection.commit();
    await audit(req.user.id, `transfer ${amount} from ${fromAccount} to ${toAccount}`);
    return res.json({ message: "Transfer successful" });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
};

const getTransactions = async (req, res, next) => {
  // Statement-style listing: optional filters (account, type, status, date
  // range) plus pagination. Response always includes `transactions` so older
  // clients keep working; `pagination` carries page metadata.
  const { account, type, status, from, to } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;
  try {
    const filters = ["a.user_id = ?"];
    const params = [req.user.id];
    if (account) {
      filters.push("(t.from_account = ? OR t.to_account = ?)");
      params.push(account, account);
    }
    if (type && ["CREDIT", "DEBIT"].includes(String(type).toUpperCase())) {
      filters.push("t.type = ?");
      params.push(String(type).toUpperCase());
    }
    if (status && ["SUCCESS", "FAILED"].includes(String(status).toUpperCase())) {
      filters.push("t.status = ?");
      params.push(String(status).toUpperCase());
    }
    if (from) {
      filters.push("t.created_at >= ?");
      params.push(from);
    }
    if (to) {
      filters.push("t.created_at <= ?");
      params.push(to);
    }
    const base = `FROM transactions t JOIN accounts a ON t.from_account = a.account_number OR t.to_account = a.account_number WHERE ${filters.join(" AND ")}`;
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${base}`, params);
    const [rows] = await pool.query(
      `SELECT t.txn_id, t.from_account, t.to_account, t.amount, t.type, t.status, t.created_at ${base} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return res.json({
      transactions: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAccounts, transferFunds, getTransactions };
