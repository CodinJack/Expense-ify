const express = require("express");
const router = express.Router();
const {addExpense, getAllExpenses, getExpenseByID, deleteExpenseByID} = require("../controllers/expense");

router
    .post("/expense", addExpense)
    .get("/expense", getAllExpenses)
    .get("/expense/:id", getExpenseByID)
    .delete("/expense/:id", deleteExpenseByID);

module.exports = router;
