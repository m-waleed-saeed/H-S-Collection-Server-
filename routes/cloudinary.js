const express = require("express");
const router = express.Router();
const multer = require("multer");
const stream = require("stream");
const { cloudinary } = require("../config/cloudinary"); // ✅ FIXED
const { verifyUser, verifyAdmin } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyUser, verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file received" });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/allImages",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    bufferStream.pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;