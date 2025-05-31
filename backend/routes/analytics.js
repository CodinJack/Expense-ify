const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics");

router.get("/summary", analyticsController.getExpenseSummary);

module.exports = router;
