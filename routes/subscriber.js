const express = require("express");
const router = express.Router();
const { addSubscriber, getSubscribers } = require("../controllers/subscriber");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// Add Subscriber (public)
router.post("/", addSubscriber);

// Get Subscribers (Admin only)
router.get("/", verifyUser, verifyAdmin, getSubscribers);

module.exports = router;
