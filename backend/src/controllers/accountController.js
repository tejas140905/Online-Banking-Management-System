const { validationResult } = require("express-validator");
const pool = require("../config/db");

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
    return res.json({ message: "Transfer successful" });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
};

const getTransactions = async (req, res, next) => {
  const { account } = req.query;
  try {
    const [rows] = await pool.query(
      "SELECT t.txn_id, t.from_account, t.to_account, t.amount, t.type, t.status, t.created_at FROM transactions t JOIN accounts a ON t.from_account = a.account_number OR t.to_account = a.account_number WHERE a.user_id = ? AND (? IS NULL OR t.from_account = ? OR t.to_account = ?) ORDER BY t.created_at DESC",
      [req.user.id, account || null, account || null, account || null],
    );
    return res.json({ transactions: rows });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAccounts, transferFunds, getTransactions };
