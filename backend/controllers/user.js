const pool = require('../db/index'); // adjust path if needed
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [req.body.username, hashedPassword]
    );

    console.log('User created with ID:', result.insertId);
    res.status(201).json({ msg: "User was created successfully." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "User was not created." });
  }
};

exports.getUsers = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: "You're not authorized!" });
    }


  try {
    const [users] = await pool.query('SELECT id, username FROM users');
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserByID = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: "You're not authorized!" });
    }


  try {
    const [rows] = await pool.query('SELECT id, username FROM users WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: "User doesn't exist" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteUserByID = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ msg: "You're not authorized!" });
    }

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "User doesn't exist" });
    }

    return res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
};
