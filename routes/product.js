const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addRating,
} = require("../controllers/product");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// Add product (Admin only)
router.post("/add", verifyUser, verifyAdmin, addProduct);

// Get all products (Public)
router.get("/", getAllProducts);

// Get product by ID (Public)
router.get("/:id", getProductById);

// Update product (Admin only)
router.put("/:id", updateProduct);

// Delete product (Admin only)
router.delete("/:id", verifyUser, verifyAdmin, deleteProduct);

// Rate product (User only)
router.post("/rating/:id", addRating);

module.exports = router;