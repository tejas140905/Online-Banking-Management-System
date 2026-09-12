const express = require("express");
const { body } = require("express-validator");
const { getAccounts, createAccount, closeAccount, transferFunds, getTransactions } = require("../controllers/accountController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getAccounts);

router.post(
  "/",
  authenticate,
  [body("label").optional().isLength({ max: 40 }).withMessage("Label max 40 chars")],
  createAccount,
);

router.delete("/:accountNumber", authenticate, closeAccount);

router.post(
  "/transfer",
  authenticate,
  [
    body("fromAccount").notEmpty().withMessage("Source account required"),
    body("toAccount").notEmpty().withMessage("Destination account required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be positive"),
  ],
  transferFunds,
);

router.get("/transactions", authenticate, getTransactions);

module.exports = router;
