const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  postedBy: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  fabric: { type: String },
  sizes: [{ type: String }], 
  colors: [{ type: String }],
  stitchedPrice: { type: Number, required: true },
  unstitchedPrice: { type: Number, required: true },
  stitchType: { type: String, enum: ["Stitched", "Unstitched"], default: "Stitched" },
  stock: { type: Number, required: true },
  images: [{ type: String }],
  ratings: [ratingSchema],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);