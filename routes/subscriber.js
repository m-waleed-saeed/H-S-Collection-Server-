const express = require("express");
const router = express.Router();
const Subscriber = require('../models/subscriber')
const { verifyToken } = require("../middleware/auth");

// Add Subscriber (public)
router.post("/", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Already subscribed!" });
        }

        const subscriber = new Subscriber({ email });
        await subscriber.save();

        res.status(201).json({ message: "Subscription successful", subscriber });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get Subscribers (Admin only)
router.get("/", verifyToken, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
        const skip = (page - 1) * limit;

        const subscribers = await Subscriber.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Subscriber.countDocuments();

        res.status(200).json({ success: true, data: subscribers, total, page, limit, });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message, });
    }
});

module.exports = router;
