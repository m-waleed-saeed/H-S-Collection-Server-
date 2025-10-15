const express = require("express");
const { createContact, getContacts, deleteContact } = require("../controllers/contact");
const { verifyUser, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// Create Contact (Public)
router.post("/", createContact);

// Get Contacts (Admin only)
router.get("/", verifyUser, verifyAdmin, getContacts);

// Delete Contact (Admin only)
router.delete("/:id", verifyUser, verifyAdmin, deleteContact);

module.exports = router;
