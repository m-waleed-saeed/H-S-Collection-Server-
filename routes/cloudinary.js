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

// ✅ Use memory storage instead of saving to 'uploads/' folder
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload image directly to Cloudinary (no local file writing)
router.post("/", verifyUser, verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/allImages",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    bufferStream.pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
