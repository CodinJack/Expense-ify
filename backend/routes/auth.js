const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// POST /log-in with Passport local strategy (using MySQL-based auth)
router.post("/log-in", authController.loginUser);

// Logout
router.get("/log-out", authController.logoutUser); 
module.exports = router;
