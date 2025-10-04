const express = require("express");
const router = express.Router();
const { addCategory, getCategories, deleteCategory } = require("../controllers/category");

// POST /api/categories/add
router.post("/add", addCategory);

// GET /api/categories
router.get("/", getCategories);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

module.exports = router;
