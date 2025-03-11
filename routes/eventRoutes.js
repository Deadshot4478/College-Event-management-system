const express = require("express");
const Event = require("../models/Event");
const req = require("express/lib/request");

const router = express.Router();

// Show Events
router.get("/", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login"); // Redirect to login if not authenticated
    }
    try {
        const events = await Event.find().sort({ date: 1 });  // Sort by date in ascending order
 // Fetch events from MongoDB
        res.render("index", { events, user: req.session.user });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Add Event (Admin Only)
router.post("/add-event", async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.redirect("/");
    
    
    const { name, date } = req.body;
    if (!name || !date) return res.redirect("/");

    try {
        await Event.create({ name, date });
        req.session.message = {type: "success", text:"Event Created successfully"};
        res.redirect("/");
       
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Delete Event (Admin Only)
router.post("/delete-event", async (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) return res.redirect("/");

    const { id } = req.body;  // Extract event ID from request body
    if (!id) return res.redirect("/");

    try {
        await Event.findByIdAndDelete(id);  // Delete event by ID
        req.session.message = {type: "error", text:"Event Deleted successfully"};
        res.redirect("/");  // Redirect to homepage after deletion
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
