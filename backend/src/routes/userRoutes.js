const express = require("express");
const { body } = require("express-validator");
const { getProfile, updateProfile } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authenticate, getProfile);

router.put(
  "/profile",
  authenticate,
  [body("name").notEmpty().withMessage("Name required")],
  updateProfile,
);

module.exports = router;
