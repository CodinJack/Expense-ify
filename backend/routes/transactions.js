const express = require("express");
const router = express.Router();
const {addExpense, getAllExpenses, getExpenseByID, deleteExpenseByID} = require("../controllers/expense");

router
    .post('/expense', verifyToken, upload.single('receipt'), addExpense)
    .get("/expense", verifyToken, getAllExpenses)
    .get("/expense/:id", verifyToken, getExpenseByID)
    .delete("/expense/:id", verifyToken, deleteExpenseByID);

module.exports = router;
