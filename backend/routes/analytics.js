const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics");
const verifyToken = require("../middleware/verifyToken");

router.get("/summary", verifyToken, analyticsController.getExpenseSummary);

module.exports = router;
