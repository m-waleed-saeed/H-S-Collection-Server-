const express = require("express");
const router = express.Router();
const multer = require("multer");
const stream = require("stream");
const { cloudinary } = require("../config/cloudinary");
const { verifyToken} = require("../middleware/auth");

const storage = multer.memoryStorage({
  limits: { fileSize: 10 * 1024 * 1024 },
});
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file received" });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/allImages",
        resource_type: "image",
        timeout: 120000,
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    bufferStream.pipe(uploadStream);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;