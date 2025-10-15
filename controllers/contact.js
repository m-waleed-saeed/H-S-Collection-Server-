const Contact = require("../models/contact");

// Add new contact message
const createContact = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const newContact = new Contact({ fullName, email, phone, subject, message });
    await newContact.save();

    res.status(201).json({ success: true, message: "Message sent successfully!", data: newContact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get all messages
const getContacts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const contacts = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Contact.countDocuments();

    res.status(200).json({ success: true, data: contacts, total, page, limit, });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message, });
  }
};
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Message deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}

module.exports = { createContact, getContacts, deleteContact };