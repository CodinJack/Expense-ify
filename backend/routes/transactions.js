const express = require("express");
const router = express.Router();
const {addExpense, getAllExpenses, getExpenseByID, deleteExpenseByID} = require("../controllers/expense");
const upload = require("../middleware/upload.js");
const verifyToken = require("../middleware/verifyToken");

router
    .post('/expense', verifyToken, upload.single('receipt'), addExpense)
    .get("/expense", verifyToken, getAllExpenses)
    .get("/expense/:id", verifyToken, getExpenseByID)
    .delete("/expense/:id", verifyToken, deleteExpenseByID);

module.exports = router;
