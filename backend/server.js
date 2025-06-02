const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

//CORS Setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, mobile apps

    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://expense-ify.vercel.app',
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/
    ];

    const isAllowed = allowedOrigins.some(allowed => {
      return typeof allowed === 'string' ? origin === allowed : allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const summaryRoutes = require("./routes/analytics");
const transactionRoutes = require("./routes/transactions");
const exportRoutes = require("./routes/export");

app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", summaryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/api/export", exportRoutes);

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Listening on port:", PORT));
