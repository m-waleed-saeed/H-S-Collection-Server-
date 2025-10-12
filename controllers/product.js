const Product = require("../models/product");

const addProduct = async (req, res) => {
  try {
    const { title, description, category, fabric, sizes, colors, stitchedPrice, unstitchedPrice, stitchType, stock, images, sizeChart } = req.body;

    if (!title || !stitchedPrice || !unstitchedPrice || !stock)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const payload = {
      title: title.trim(),
      description: description || "",
      category: category || null,
      fabric: fabric || "",
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      stitchedPrice: Number(stitchedPrice),
      unstitchedPrice: Number(unstitchedPrice),
      stitchType: stitchType || "Stitched",
      stock: Number(stock),
      images: Array.isArray(images) ? images : [],
      sizeChart: sizeChart || { shirt: [], trouser: [] }
    };

    const newProduct = await Product.create(payload);

    return res.status(201).json({
      success: true,
      message: "Product successfully added",
      product: newProduct
    });

  } catch (error) {
    console.error("addProduct error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};


// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category").lean();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};

// Get Single Product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const updatePayload = {
      ...req.body,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes,
      colors: Array.isArray(req.body.colors) ? req.body.colors : req.body.colors,
      sizeChart: req.body.sizeChart || undefined,
    };

    Object.keys(updatePayload).forEach(k => updatePayload[k] === undefined && delete updatePayload[k]);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("updateProduct error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product and images deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
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