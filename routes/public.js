const express = require("express")
const Products = require("../models/product")
const Banners = require("../models/banner")
const Categories = require("../models/category")

const router = express.Router()

router.get("/website-content/products", async (req, res) => {
    try {

        const products = await Products.find().populate("category", "name").lean()

        res.status(200).json({ message: "Data fetched successfully", isError: false, products });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", isError: true, error });
    }
});

router.get("/website-content/banners", async (req, res) => {
    try {

        const banners = await Banners.find().lean()

        res.status(200).json({ message: "Data fetched successfully", isError: false, banners });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", isError: true, error });
    }
});

router.get("/website-content/categories", async (req, res) => {
    try {

        const categories = await Categories.find().lean()

        res.status(200).json({ message: "Data fetched successfully", isError: false, categories });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", isError: true, error });
    }
});

module.exports = router