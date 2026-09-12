const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  getPendingUsers,
  approveUser,
  blockUser,
  unblockUser,
  allAccounts,
  monitorTransactions,
  stats,
  getAuditLogs,
  getPendingClosures,
  approveClosure,
  rejectClosure,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, authorize(["ADMIN"]));

router.get("/users/pending", getPendingUsers);
router.post("/users/:userId/approve", approveUser);
router.post("/users/:userId/block", blockUser);
router.post("/users/:userId/unblock", unblockUser);
router.get("/accounts", allAccounts);
router.get("/transactions", monitorTransactions);
router.get("/stats", stats);
router.get("/logs", getAuditLogs);
router.get("/closures/pending", getPendingClosures);
router.post("/closures/:id/approve", approveClosure);
router.post("/closures/:id/reject", rejectClosure);

module.exports = router;
