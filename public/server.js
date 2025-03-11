require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const Event = require("../models/Event");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Initialize session BEFORE using it
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Middleware for Flash Messages
app.use((req, res, next) => {
  res.locals.message = req.session.message || null; // ✅ Prevents undefined error
  req.session.message = null; // ✅ Clear message after displaying
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ✅ Login Route
app.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Register Route
app.get("/register", (req, res) => {
  res.render("register");
});

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
const authRoutes = require("../routes/authRoutes");
const eventRoutes = require("../routes/eventRoutes");

app.use("/", eventRoutes);
app.use("/", authRoutes);

// ✅ Fix: Fetch events before rendering homepage
app.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }
  const events = await Event.find();
  res.render("index", { events, user: req.session.user });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
