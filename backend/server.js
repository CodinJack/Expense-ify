const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const app = express();

require("dotenv").config();
require("./passport");

// 👉 Required for secure cookies behind Render/Heroku reverse proxy
app.set("trust proxy", 1);  // Must come before session


app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://expense-ify.vercel.app',
    '*'
  ],
  credentials: true // Important for sessions/cookies
}));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  name: "connect.sid",
  secret: "cats",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // True for HTTPS
    sameSite: process.env.SITE_SETTING, // Required for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const summaryRoutes = require("./routes/analytics");
const transactionRoutes = require("./routes/transactions");
const exportRoutes = require("./routes/export");
const { prepare } = require("./db");

app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", summaryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Listening on port:", PORT));
