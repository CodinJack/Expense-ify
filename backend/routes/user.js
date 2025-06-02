const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router.post("/create-user", userController.createUser);
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ msg: "Not authenticated" });
  }
});

module.exports = router;
