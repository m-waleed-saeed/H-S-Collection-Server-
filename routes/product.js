const express = require("express");
const router = express.Router();
const Product = require("../models/product")
const multer = require("multer")
const { cloudinary, deleteFileFromCloudinary } = require("../config/cloudinary")
const { verifyToken } = require("../middleware/auth");

const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "allImages", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );
    uploadStream.end(file.buffer);
  });
};


router.post(`/add`, verifyToken, upload.array("files"), async (req, res) => {
  try {

    let formData = req.body;

    let { sizes, sizeChart } = formData
    console.log('formData', formData)

    sizes = JSON.parse(sizes)
    sizeChart = JSON.parse(sizeChart)

    const uploadedFiles = await Promise.all(req.files.map(uploadToCloudinary));

    const newData = { ...formData, images: uploadedFiles, sizes, sizeChart }

    const newProduct = await Product.create(newData);

    newProduct.save();

    return res.status(201).json({ success: true, message: "Product successfully added", product: newProduct });
  } catch (error) {
    console.error("Add Product error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
})

router.patch("/update/:id", verifyToken, upload.array("files"), async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    const sizes = JSON.parse(formData.sizes || "[]");
    const sizeChart = JSON.parse(formData.sizeChart || "{}");
    const imagesURL = JSON.parse(formData.imagesURL || "[]");

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // --- Existing images in DB
    let existingImages = product.images || [];

    // --- STEP 1: Delete images that are NOT in the new imagesURL array
    const imagesToDelete = existingImages.filter(
      (img) => !imagesURL.some((url) => url.url === img.url)
    );

    await Promise.all(
      imagesToDelete.map((img) =>
        img.public_id ? cloudinary.uploader.destroy(img.public_id) : null
      )
    );

    existingImages = existingImages.filter((img) =>
      imagesURL.some((url) => url.url === img.url)
    );

    // --- STEP 2: Upload any new files (if present)
    let uploadedImages = [];
    if (req.files?.length) {
      uploadedImages = await Promise.all(req.files.map(uploadToCloudinary));
    }

    // --- STEP 3: Combine old + new images
    const finalImages = [...existingImages, ...uploadedImages];

    // --- STEP 4: Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...formData, sizes, sizeChart, images: finalImages },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("Update Product error:", err);
    res.status(500).json({ success: false, message: err.message || "Something went wrong", isError: true });
  }
});


// Get all products (Public)
router.get("/all", async (req, res) => {
  try {
    const page = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([Product.find().populate("category", "name").skip(skip).limit(limit).lean(), Product.countDocuments(),]);
    res.status(200).json({ success: true, data: products, total, page, totalPages: Math.ceil(total / limit), });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Something went wrong", });
  }
});

// Get product by ID (Public)
router.get("/single-with-id/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, prod: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
});

// Update product (Admin only)
router.put("/:id", async (req, res) => {
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
});

// Delete product (Admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) { return res.status(404).json({ success: false, message: 'Product not found' }); }

    if (product.images && Array.isArray(product.images)) { for (const img of product.images) { if (img.public_id) { await deleteFileFromCloudinary(img.public_id); } } }
    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: 'Product and images deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Rate product (User only)
router.post("/rating/:id", async (req, res) => {
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

    return res.status(201).json({ success: true, message: "Rating added successfully", product: updatedProduct });
  } catch (error) {
    console.error("addRating error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
});

module.exports = router;