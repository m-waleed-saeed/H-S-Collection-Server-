const Banner = require('../models/banner')

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
// Delete Banner

const deleteBanner = async (req, res) => {

    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
        res.status(400)
        throw new Error('Banner was not deleted')
    } else {
        res.status(201).json('Banner deleted succesfully')

    }
}
// Get All Banners

const getAllBanner =async (req, res) => {

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

module.exports = { createBanner, deleteBanner, getAllBanner, getRandomBanner }