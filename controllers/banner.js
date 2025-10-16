const Banner = require('../models/banner')
const { deleteFileFromCloudinary } = require('../config/cloudinary');

// Create Banner
const createBanner = async (req, res) => {

    const newBanner = await Banner(req.body);
    const banner = await newBanner.save();

    if (!banner) {
        res.status(400)
        throw new Error('Banner is not created')
    } else {
        res.status(200).json(banner)
    }
}

// Get All Banners
const getAllBanner =async (req, res) => {

    console.log('Fetching all banners...');
    const banners = await Banner.find();

    if (!banners) {
        res.status(400)
        throw new Error('Banner were not fetched or something went wrong')
    } else {
        res.status(200).json(banners)

    }
    
}

// Get Random Banners
const getRandomBanner =async (req, res) => {

    const banners = await Banner.find();
    
    if (!banners) {
        res.status(400)
        throw new Error('Banner were not fetched or something went wrong')
    } else {
        const randomIndex = Math.floor(Math.random() * banners.length);
        const randomBanner = banners[randomIndex];
        res.status(200).json(randomBanner);
    }
}

// Delete Banner
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const fileName = parts.pop();
  const folderPath = parts.slice(parts.indexOf('upload') + 1).join('/'); 
  return folderPath + '/' + fileName.split('.')[0]; 
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // extract public_id and delete from Cloudinary
    if (banner.image) {
      const publicId = getPublicIdFromUrl(banner.image);
      await deleteFileFromCloudinary(publicId);
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
};

module.exports = { createBanner, deleteBanner, getAllBanner, getRandomBanner }