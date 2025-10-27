const express = require('express');
const router = express.Router();
const Banner = require('../models/banner')
const { deleteFileFromCloudinary } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/auth');

// Create Banner (Admin only)
router.post('/', verifyToken, async (req, res) => {

    const newBanner = await Banner(req.body);
    const banner = await newBanner.save();

    if (!banner) {
        res.status(400)
        throw new Error('Banner is not created')
    } else {
        res.status(200).json(banner)
    }
});

// Get All Banner (Admin only)
router.get('/', verifyToken, async (req, res) => {
    const banners = await Banner.find();
    if (!banners) {
        res.status(400)
        throw new Error('Banner were not fetched or something went wrong')
    } else { res.status(200).json(banners) }
});

// Delete Banner (Admin only)
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const fileName = parts.pop();
    const folderPath = parts.slice(parts.indexOf('upload') + 1).join('/');
    return folderPath + '/' + fileName.split('.')[0];
};

router.delete('/:id', verifyToken, async (req, res) => {
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
});

// Get Random Banner (Public)
router.get('/random', async (req, res) => {
    const banners = await Banner.find();

    if (!banners) {
        res.status(400)
        throw new Error('Banner were not fetched or something went wrong')
    } else {
        const randomIndex = Math.floor(Math.random() * banners.length);
        const randomBanner = banners[randomIndex];
        res.status(200).json(randomBanner);
    }
});

// Get Two Random Banner (Public)
router.get("/random-two", async (req, res) => {
    try {
        const banners = await Banner.find();

        if (!banners || banners.length === 0) {
            return res.status(404).json({ message: "No banners found" });
        }

        // Shuffle banners and take first 2
        const shuffled = banners.sort(() => 0.5 - Math.random());
        const randomTwo = shuffled.slice(0, 2);

        res.status(200).json(randomTwo);
    } catch (error) {
        console.error("Error fetching random banners:", error);
        res.status(500).json({ message: "Failed to fetch random banners" });
    }
});


module.exports = router;