const express = require("express")
const Products = require("../models/product")
const Banners = require("../models/banner")
const Categories = require("../models/category")

const router = express.Router()

router.get("/website-content", async (req, res) => {
    try {

        const queries = [
            Products.find().populate("category", "name").lean(),
            Banners.find(),
            Categories.find(),
        ];

        const [products, banners, categories] = await Promise.all(queries);

        res.status(200).json({ message: "Data fetched successfully", isError: false, products, banners, categories });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", isError: true, error });
    }
});

module.exports = router