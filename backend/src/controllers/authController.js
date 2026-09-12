const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("../config/db");
const { generateAccountNumber } = require("../utils/accountNumber");
const { audit } = require("../utils/audit");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const REFRESH_DAYS = Number(process.env.REFRESH_EXPIRES_DAYS || 7);

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

// Refresh tokens are random opaque strings; only their SHA-256 hash is stored.
// Rotation: every use revokes the old token and issues a new pair, so a stolen
// refresh token is usable at most once before the legitimate client's fails.
const hashRefreshToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

const issueRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await pool.query("INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)", [
    userId,
    hashRefreshToken(raw),
    expiresAt,
  ]);
  return raw;
};

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, 'USER', 'PENDING')",
        [name, email, hashed],
      );
      const userId = userResult.insertId;
      const accountNumber = generateAccountNumber();
      await connection.query(
        "INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, ?)",
        [userId, accountNumber, 0],
      );
      await connection.commit();
      await audit(userId, `register ${email}`);
      return res.status(201).json({
        message: "Registration submitted. Await admin approval.",
        accountNumber,
      });
    } catch (err) {
      await connection.rollback();
      return next(err);
    } finally {
      connection.release();
    }
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, password, role, status FROM users WHERE email = ?",
      [email],
    );
    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = rows[0];
    if (user.status !== "ACTIVE") {
      return res
        .status(403)
        .json({ message: "Account not active. Contact admin.", status: user.status });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken(user);
    const refreshToken = await issueRefreshToken(user.id);
    await audit(user.id, "login");
    return res.json({
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const [rows] = await pool.query(
      "SELECT rt.id, rt.user_id, rt.expires_at, u.name, u.email, u.role, u.status FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = ? AND rt.revoked = 0",
      [hashRefreshToken(req.body.refreshToken)],
    );
    const row = rows[0];
    if (!row || new Date(row.expires_at) < new Date() || row.status !== "ACTIVE") {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    await pool.query("UPDATE refresh_tokens SET revoked = 1 WHERE id = ?", [row.id]);
    const user = { id: row.user_id, name: row.name, email: row.email, role: row.role };
    const token = signToken(user);
    const refreshToken = await issueRefreshToken(row.user_id);
    return res.json({
      token,
      refreshToken,
      user,
    });
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.body?.refreshToken) {
      await pool.query("UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?", [
        hashRefreshToken(req.body.refreshToken),
      ]);
    }
    // Always 200: logout must succeed even with a missing/invalid token.
    return res.json({ message: "Logged out" });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, refresh, logout };
