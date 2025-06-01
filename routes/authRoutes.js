const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

// ✅ Email Verification Route
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.send("Invalid or expired token.");
  }
  user.isVerified = true;
  user.verificationToken = null;
  await user.save();
  req.session.message = { type: "success", text: "Email verified. You can now login." };
  res.redirect("/login");
});

// ✅ Registration Routes
router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword, isAdmin } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    req.session.message = { type: "error", text: "All fields are required" };
    return res.redirect("/register");
  }

  if (password !== confirmPassword) {
    req.session.message = { type: "error", text: "Passwords do not match" };
    return res.redirect("/register");
  }

  try {
    const existingUsername = await User.findOne({ username });
    const existingUseremail = await User.findOne({ email });

    if (existingUsername) {
      req.session.message = { type: "error", text: "Username already exists" };
      return res.redirect("/register");
    }

    if (existingUseremail) {
      req.session.message = { type: "error", text: "Email already exists" };
      return res.redirect("/register");
    }
    const isAdminValue = isAdmin === "on" ? true : false;
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: isAdmin === "on" || false,
      isVerified: false,
      verificationToken
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationURL = `http://${req.headers.host}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationURL}">here</a> to verify your email.</p>`,
    });

    req.session.message = { type: "success", text: "Registration successful. Check your email to verify." };
    res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    req.session.message = { type: "error", text: "Error during registration" };
    res.redirect("/register");
  }
});

// ✅ Login Routes
router.get("/login", (req, res) => res.render("login"));

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.session.message = { type: "error", text: "Invalid username or password" };
    return res.redirect("/login");
  }

  if (!user.isVerified) {
    req.session.message = { type: "error", text: "Please verify your email before logging in." };
    return res.redirect("/login");
  }

  req.session.user = user;
  req.session.message = { type: "success", text: "Login successful" };
  res.redirect("/");
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = router;
