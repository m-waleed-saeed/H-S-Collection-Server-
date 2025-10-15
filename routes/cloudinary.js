const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const { verifyUser, verifyAdmin } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Upload image (Admin only)
router.post('/', verifyUser, verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/allImages',
      resource_type: 'image',
    });

    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;