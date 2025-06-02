const express = require("express");
const router = express.Router();
const db = require("../db");
const userController = require("../controllers/user");
const authenticateJWT = require("../middleware/verifyToken");

// Register a new user
router.post("/create-user", userController.createUser);

// Get logged-in user's details (JWT-protected)
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const user = await db.query("SELECT username FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user: { username: user[0][0].username } });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
