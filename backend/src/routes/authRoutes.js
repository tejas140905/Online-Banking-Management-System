const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { register, login, refresh, logout } = require("../controllers/authController");

const router = express.Router();

// Brute-force protection on auth endpoints (tunable via AUTH_RATE_LIMIT_MAX).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later" },
});

router.use(authLimiter);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  login,
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token required")],
  refresh,
);

router.post("/logout", logout);

module.exports = router;
