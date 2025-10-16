// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const fs = require('fs');
// const cloudinary = require('../config/cloudinary');
// const { verifyUser, verifyAdmin } = require('../middleware/auth');

// const upload = multer({ dest: 'uploads/' });

// // Upload image (Admin only)
// router.post('/', verifyUser, verifyAdmin, upload.single('file'), async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'ecommerce/allImages',
//       resource_type: 'image',
//     });

//     fs.unlinkSync(req.file.path);

//     res.json({ url: result.secure_url, public_id: result.public_id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const stream = require("stream");
const cloudinary = require("../config/cloudinary");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// ✅ Memory storage for in-memory uploads (Vercel safe)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

router.post("/", verifyUser, verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    // ✅ Check file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    console.log("File received:", req.file.originalname);

    // ✅ Create a readable buffer stream for Cloudinary
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    // ✅ Upload directly to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/allImages",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: error.message });
        }

        // ✅ Success
        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    bufferStream.pipe(uploadStream);
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
