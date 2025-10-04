const express = require("express");
const router = express.Router();

const {  addProduct,  getAllProducts,  getProductById,  updateProduct,  deleteProduct,  addRating,} = require("../controllers/product");

// Add product
router.post("/add", addProduct);
// Get all products          
router.get("/", getAllProducts);       
// Get product by ID
router.get("/:id", getProductById);    
// Update product
router.put("/:id", updateProduct);     
// Delete product
router.delete("/:id", deleteProduct);  
// Rate product
router.post("/rating/:id", addRating);

module.exports = router;