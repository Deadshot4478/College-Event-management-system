const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/Users");

const router = express.Router();

// User Registration Route


router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword, isAdmin } = req.body;

  // Check for missing fields
  if (!username || !password || !confirmPassword) {
    console.log("Missing fields");
    req.session.message = {type: "error", text:"Mising username or password"};
    return res.redirect("/register");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    console.log("Passwords do not match");
    req.session.message = {type: "error", text:"Password do not match"};
    return res.redirect("/register");
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already taken");
      req.session.message = {type: "error", text: "Username Already taken"};
        
      return res.redirect("/register");
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      password: hashedPassword,
      isAdmin: isAdmin === "on" || false,  // Default to false if not specified
    });

    console.log("User registered successfully");
    req.session.message = {type: "success", text:"User registered successfully || Now Login "};
    res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    req.session.message = {type: "error", text: "Registration Error || Try again Or Refersh the page"};
    res.status(500).send("Internal Server Error");
  }
});

// User Login Route
router.get("/login", (req, res) => res.render("login"));

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.session.message = {type: "error", text:"Invalid username or password"};
    return res.redirect("/login");
  }
  req.session.user = user;
  req.session.message = {type: "success", text:"Login Successfull"};
  res.redirect("/");
});

// User Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout Error:", err);
        return res.redirect("/");
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.redirect("/login");
    });
  });
  
module.exports = router;

