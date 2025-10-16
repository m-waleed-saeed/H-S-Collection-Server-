const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, });

const deleteFileFromCloudinary = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id)
        if (result.result === 'ok') {
            console.log('File deleted successfully')
        } else {
            console.log('File not found or already deleted')
        }
        return result;
    } catch (error) {
        console.log('Error deleting file:', error);
        return error;
    }
}

module.exports = { cloudinary, deleteFileFromCloudinary };