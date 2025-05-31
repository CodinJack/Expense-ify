const express = require("express");
const passport = require("passport");

const router = express.Router();
const authController = require("../controllers/auth");

// POST /log-in with Passport local strategy (using MySQL-based auth)
router.post("/log-in", authController.loginUser);

// GET /log-out to log the user out
router.get("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
