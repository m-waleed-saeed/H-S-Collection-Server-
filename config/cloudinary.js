const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, });

module.exports = cloudinary;

// const deleteFileFromCloudinary = async (public_id) => {
//   try {
//     const result = await cloudinary.uploader.destroy(public_id)
//     if (result.result === 'ok') {
//       console.log('File deleted successfully')
//     } else {
//       console.log('File not found or already deleted')
//     }
//     return result;
//   } catch (error) {
//     console.log('Error deleting file:', error);
//     return error;
//   }
// }

// const express = require("express");
// const multer = require("multer");
// const stream = require("stream");
// const cloudinary = require("../config/cloudinary"); // your config file
// const router = express.Router();


// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(req.file.buffer);

//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder: "uploads" }, // optional Cloudinary folder
//       (error, result) => {
//         if (error) return res.status(500).json({ error });
//         res.status(200).json({ url: result.secure_url, public_id: result.public_id });
//       }
//     );

//     bufferStream.pipe(uploadStream);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
