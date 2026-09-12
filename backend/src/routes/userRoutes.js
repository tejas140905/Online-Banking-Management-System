const express = require("express");
const { body } = require("express-validator");
const { getProfile, updateProfile, changePassword } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authenticate, getProfile);

router.put(
  "/profile",
  authenticate,
  [body("name").notEmpty().withMessage("Name required")],
  updateProfile,
);

router.put(
  "/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password min 6 chars"),
  ],
  changePassword,
);

module.exports = router;
