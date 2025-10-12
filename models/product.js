const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  postedBy: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const shirtSizeSchema = new mongoose.Schema({
  size: { type: String, trim: true },
  length: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  armHole: { type: Number },
  sleeveLength: { type: Number },
}, { _id: false });

const trouserSizeSchema = new mongoose.Schema({
  size: { type: String, trim: true },
  length: { type: Number },
  bottom: { type: Number },
}, { _id: false });

const sizeChartSchema = new mongoose.Schema({
  shirt: { type: [shirtSizeSchema], default: [] },
  trouser: { type: [trouserSizeSchema], default: [] }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  fabric: { type: String,trim: true  },
  sizes: [{ type: String ,trim: true }],
  colors: [{ type: String ,trim: true }],
  stitchedPrice: { type: Number, required: true },
  unstitchedPrice: { type: Number, required: true },
  stitchType: { type: String, enum: ["Stitched", "Unstitched"], default: "Stitched" },
  stock: { type: Number, required: true },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],
  ratings: [ratingSchema],
  sizeChart: { type: sizeChartSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);