const mongoose = require("mongoose");

const customSizeSchema = new mongoose.Schema({
  shirtLength: Number,
  shirtChest: Number,
  shirtWaist: Number,
  shirtHip: Number,
  shirtArmHole: Number,
  shirtSleeveLength: Number,
  trouserLength: Number,
  trouserBottom: Number,
}, { _id: false });

const orderProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  stitchType: { type: String, enum: ["Stitched", "Unstitched"], default: "Stitched" },
  customSize: { type: customSizeSchema, default: null },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: String, required: false },
  orderNumber: { type: String, unique: true, trim: true },
  products: [orderProductSchema],
  shippingAddress: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
  },
  type: { type: String, enum: ["confirmed", "abandoned"], default: "confirmed" },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "COD" },
  status: { type: String, enum: ["pending", "delivered", "cancelled", "returned"], default: "pending" }
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const random = Math.floor(1000 + Math.random() * 900000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    this.orderNumber = `ORD-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);