const { validationResult } = require("express-validator");
const pool = require("../config/db");

const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, status FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const [accounts] = await pool.query(
      "SELECT account_number, balance FROM accounts WHERE user_id = ?",
      [req.user.id],
    );
    return res.json({ user: rows[0], accounts });
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name } = req.body;
  try {
    await pool.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    return res.json({ message: "Profile updated" });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getProfile, updateProfile };
