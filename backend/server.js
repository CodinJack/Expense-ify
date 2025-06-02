const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const app = express();

require("dotenv").config();           // Load environment variables
require("./passport");                // Register passport strategy BEFORE initializing it

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  name: "connect.sid",
  secret: "cats",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production with HTTPS
    sameSite: "none",
    maxAge:24*60*60*1000
  }
}));

app.use(cors({
  origin: "https://expense-ify.vercel.app", // frontend URL
  credentials: true, // this allows sending cookies
}));

app.use(passport.initialize());       // Must come after passport strategy is loaded
app.use(passport.session());

const PORT = process.env.PORT || 5000;

//routes
const userRoutes = require("./routes/user");
app.use("/api", userRoutes);
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);
const summaryRoutes = require("./routes/analytics");
app.use("/api", summaryRoutes);
const transactionRoutes = require("./routes/transactions");
app.use("/transactions", transactionRoutes);
const exportRoutes = require("./routes/export");
const { prepare } = require("./db");
app.use("/api/export", exportRoutes);

const server = () => {
    app.listen(PORT, () => {
        console.log("Listening on port:", PORT);
    });
};

server();
