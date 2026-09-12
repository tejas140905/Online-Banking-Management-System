const express = require("express");
const { platformStats } = require("../controllers/platformController");

const router = express.Router();

router.get("/stats", platformStats);

module.exports = router;
