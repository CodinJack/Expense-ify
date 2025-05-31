const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ msg: "Login successful", user });
    });
  })(req, res, next);
};
