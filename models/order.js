const e = require("express");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true ,trim: true},
    price: { type: Number, required: true ,trim: true} 
  }],
  shippingAddress: {
    name: { type: String, required: true ,trim: true},
    email: { type: String, required: true ,trim: true},
    phone: { type: String, required: true ,trim: true},
    street: { type: String, required: true ,trim: true},
    city: { type: String, required: true ,trim: true},
    country: { type: String, required: true ,trim: true}
  },
  totalAmount: { type: Number, required: true ,trim: true},
  paymentMethod: { type: String, default: "COD" },
  status: { 
    type: String, 
    enum: ["pending", "delivered", "cancelled", "returned"], 
    default: "pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);