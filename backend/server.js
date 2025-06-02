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
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://expense-ify.vercel.app',
      // Add your local network IP range
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  name: "connect.sid",
  secret: "cats",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false, // Allow JavaScript access on mobile
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
    domain: undefined, // Don't set domain explicitly
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
