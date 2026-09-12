const pool = require("../config/db");

// Public, non-sensitive platform aggregates for the bank homepage.
// No auth: exposes counts and success rates only, never personal data.
const platformStats = async (req, res, next) => {
  try {
    const [[users]] = await pool.query(
      "SELECT COUNT(*) AS n FROM users WHERE role = 'USER' AND status = 'ACTIVE'",
    );
    const [[accounts]] = await pool.query("SELECT COUNT(*) AS n FROM accounts");
    const [[txns]] = await pool.query(
      "SELECT COUNT(*) AS n, COALESCE(SUM(status = 'SUCCESS'), 0) AS ok FROM transactions",
    );
    const successRate = txns.n ? Math.round((Number(txns.ok) / txns.n) * 10000) / 100 : 100;
    return res.json({
      customers: users.n,
      accounts: accounts.n,
      transactions: txns.n,
      successRate,
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { platformStats };
