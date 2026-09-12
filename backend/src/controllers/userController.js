const bcrypt = require("bcryptjs");
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

const changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { currentPassword, newPassword } = req.body;
  try {
    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    // Invalidate all refresh tokens so other sessions must sign in again.
    await pool.query("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?", [req.user.id]);
    return res.json({ message: "Password changed. Please sign in again." });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
