const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("../config/db");
const { generateAccountNumber } = require("../utils/accountNumber");

dotenv.config({ path: path.join(__dirname, "..", "..", "env.example") });

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );

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
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
