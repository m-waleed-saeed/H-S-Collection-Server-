const Product = require("../models/product");

// ADD PRODUCT
const addProduct = async (req, res) => {
  try {
    const {
      title, description, category, fabric, sizes, colors,
      stitchedPrice, unstitchedPrice, originalStitchedPrice, originalUnstitchedPrice,
      stitchType, images, sizeChart, unstitchedQuantity
    } = req.body;

    // Validate required fields
    if (!title || !stitchedPrice || !unstitchedPrice || !originalStitchedPrice || !originalUnstitchedPrice)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    // Validate sizes
    if (!Array.isArray(sizes) || sizes.some(s => !s.size || typeof s.quantity !== "number"))
      return res.status(400).json({ success: false, message: "Sizes must be array of {size, quantity}" });

    const payload = {
      title: title.trim(),
      description: description || "",
      category: category || null,
      fabric: fabric || "",
      sizes,
      colors: Array.isArray(colors) ? colors : [],
      stitchedPrice: Number(stitchedPrice),
      unstitchedPrice: Number(unstitchedPrice),
      originalStitchedPrice: Number(originalStitchedPrice),
      originalUnstitchedPrice: Number(originalUnstitchedPrice),
      unstitchedQuantity: Number(unstitchedQuantity) || 0,
      stitchType: stitchType || "Stitched",
      images: Array.isArray(images) ? images : [],
      sizeChart: sizeChart || { shirt: [], trouser: [] },
    };

    const newProduct = await Product.create(payload);

    return res.status(201).json({
      success: true,
      message: "Product successfully added",
      product: newProduct
    });

  } catch (error) {
    console.error("Add Product error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const products = await Product.find().populate("category").skip(skip).limit(limit).lean();

    const total = await Product.countDocuments();

    res.status(200).json({ success: true, data: products, total, page, limit, });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Something went wrong", });
  }
};

// GET SINGLE PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
};

// UPDATE PRODUCT (with sizes)
const updateProduct = async (req, res) => {
  try {
    const updatePayload = {
      ...req.body,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : undefined,
      colors: Array.isArray(req.body.colors) ? req.body.colors : undefined,
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

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: "Product and images deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

// ADD RATING
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