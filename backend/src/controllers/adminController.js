const { validationResult } = require("express-validator");
const pool = require("../config/db");
const { audit } = require("../utils/audit");

const getPendingUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, status FROM users WHERE status = 'PENDING'",
    );
    return res.json({ users: rows });
  } catch (err) {
    return next(err);
  }
};

const approveUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    await pool.query("UPDATE users SET status = 'ACTIVE' WHERE id = ?", [userId]);
    await audit(req.user.id, `approve user #${userId}`);
    return res.json({ message: "User approved" });
  } catch (err) {
    return next(err);
  }
};

const blockUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    await pool.query("UPDATE users SET status = 'BLOCKED' WHERE id = ?", [userId]);
    await audit(req.user.id, `block user #${userId}`);
    return res.json({ message: "User blocked" });
  } catch (err) {
    return next(err);
  }
};

const unblockUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    await pool.query("UPDATE users SET status = 'ACTIVE' WHERE id = ?", [userId]);
    await audit(req.user.id, `unblock user #${userId}`);
    return res.json({ message: "User unblocked" });
  } catch (err) {
    return next(err);
  }
};

const allAccounts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT a.account_number, a.label, a.balance, u.name, u.email, u.status FROM accounts a JOIN users u ON a.user_id = u.id",
    );
    return res.json({ accounts: rows });
  } catch (err) {
    return next(err);
  }
};

const monitorTransactions = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT txn_id, from_account, to_account, amount, type, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 200",
    );
    return res.json({ transactions: rows });
  } catch (err) {
    return next(err);
  }
};

const stats = async (req, res, next) => {  try {
    const [[userCount]] = await pool.query(
      "SELECT COUNT(*) AS total_users FROM users WHERE role = 'USER'",
    );
    const [[activeAccounts]] = await pool.query(
      "SELECT COUNT(*) AS total_accounts FROM accounts",
    );
    const [[txnCount]] = await pool.query(
      "SELECT COUNT(*) AS total_txns FROM transactions",
    );
    return res.json({
      totalUsers: userCount.total_users,
      totalAccounts: activeAccounts.total_accounts,
      totalTransactions: txnCount.total_txns,
    });
  } catch (err) {
    return next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  try {
    const [rows] = await pool.query(
      "SELECT l.log_id, l.action, l.created_at, u.name AS admin_name, u.email AS admin_email FROM admin_logs l JOIN users u ON u.id = l.admin_id ORDER BY l.created_at DESC LIMIT ?",
      [limit],
    );
    return res.json({ logs: rows });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  blockUser,
  unblockUser,
  allAccounts,
  monitorTransactions,
  stats,
  getAuditLogs,
};
