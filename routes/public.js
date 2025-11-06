  const express = require("express")
  const Products = require("../models/product")
  const Banners = require("../models/banner")
  const Categories = require("../models/category")

  const router = express.Router()
  router.get("/website-content", async (req, res) => {
    try {
      const [products, banners, categories] = await Promise.all([Products.find().populate("category", "name").lean(), Banners.find().lean(), Categories.find().lean(),]);

      let randomTwo = [];
      if (banners && banners.length > 0) {
        const shuffled = banners.sort(() => 0.5 - Math.random());
        randomTwo = shuffled.slice(0, 2);
      }
      res.status(200).json({ message: "Data fetched successfully", isError: false, products, banners: randomTwo, categories, });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", isError: true, error, });
    }
  });


  module.exports = router