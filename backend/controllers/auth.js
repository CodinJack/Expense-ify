const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.logoutUser = (req, res) => {
  // On client side, just delete the token (no server-side session to destroy)
  return res.status(200).json({ msg: "Logout successful" });
};
