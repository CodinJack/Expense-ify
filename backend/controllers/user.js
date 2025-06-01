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
