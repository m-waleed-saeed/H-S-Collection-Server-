const Product = require("../models/product");

// Add Product
const addProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, message: "Product successfully added", product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category").lean();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

// Get Single Product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category").lean();
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

// Add Rating & Review

const addRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { postedBy, email, rating, review } = req.body;

        if (!postedBy || !email || !rating) {
            return res.status(400).json({ success: false, message: "postedBy, email and rating are required." });
        }

        const numericRating = Number(rating);
        if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const alreadyReviewed = product.ratings.some(r => r.email.toLowerCase() === email.toLowerCase());
        if (alreadyReviewed) {
            return res.status(409).json({ success: false, message: "You have already added a review for this product." });
        }

        product.ratings.push({ postedBy, email, rating: numericRating, review: review || "", createdAt: new Date() });

        await product.save();

        const updatedProduct = await Product.findById(id).populate("category").lean();

        return res.status(200).json({ success: true, message: "Rating added successfully", product: updatedProduct });
    } catch (error) {
        console.error("addRating error:", error);
        return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
    }
};

module.exports = { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct, addRating };