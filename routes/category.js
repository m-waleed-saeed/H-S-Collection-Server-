const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const { verifyToken } = require("../middleware/auth");

router.post("/add", verifyToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is required" });

        const already = await Category.findOne({ name: name.trim() });
        if (already) return res.status(409).json({ success: false, message: "Category already exists" });

        const category = new Category({ name: name.trim() });
        await category.save();
        return res.status(201).json({ success: true, message: "Category created", category });
    } catch (error) {
        console.error("addCategory error:", error);
        return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
});

router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().lean().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("getCategories error:", error);
        return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Category.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
        return res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        console.error("deleteCategory error:", error);
        return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
});

module.exports = router;
