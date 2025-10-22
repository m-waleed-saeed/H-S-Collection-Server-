const express = require("express");
const router = express.Router();
const Product = require("../models/product")
const multer = require("multer")
const { cloudinary } = require("../config/cloudinary")
const { getAllProducts, getProductById, updateProduct, deleteProduct, addRating, } = require("../controllers/product");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

const storage = multer.memoryStorage()
const upload = multer({ storage })

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "allImages", resource_type: "image" },  // Set resource type dynamically
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


router.post(`/add`, upload.array("files"), async (req, res) => {
  try {

    let formData = req.body;

    let { sizes, sizeChart } = formData
    console.log('formData', formData)

    sizes = JSON.parse(sizes)
    sizeChart = JSON.parse(sizeChart)
    console.log('sizes', sizes)
    // Validate sizes
    // if (!Array.isArray(formData.sizes) || formData.sizes.some(s => !s.size || typeof s.quantity !== "number"))
    //   return res.status(400).json({ success: false, message: "Sizes must be array of {size, quantity}" });

    const uploadedFiles = await Promise.all(req.files.map(uploadToCloudinary));

    const newData = { ...formData, images: uploadedFiles, sizes, sizeChart }

    const newProduct = await Product.create(newData);

    return res.status(201).json({ success: true, message: "Product successfully added", product: newProduct });
  } catch (error) {
    console.error("Add Product error:", error);
    return res.status(500).json({ success: false, error: error.message || "Something went wrong" });
  }
})

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