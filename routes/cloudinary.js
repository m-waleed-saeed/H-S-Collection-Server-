const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    // upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/allImages',
      resource_type: 'image',
    });

    // remove temporary file
    fs.unlinkSync(req.file.path);

    // return the image URL to frontend
    res.json({ url: result.secure_url, public_id: result.public_id });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;