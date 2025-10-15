const express = require("express");
const router = express.Router();
const { addCategory, getCategories, deleteCategory } = require("../controllers/category");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// Add Category (Admin only)
router.post("/add", verifyUser, verifyAdmin, addCategory);

// Get Categories (Public)
router.get("/", getCategories);

// Delete Category (Admin only)
router.delete("/:id", verifyUser, verifyAdmin, deleteCategory);

module.exports = router;
