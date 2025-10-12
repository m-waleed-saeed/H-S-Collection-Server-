const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  orderNumber: { type: String, unique: true, trim: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
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
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: "COD" },
  status: { type: String, enum: ["pending", "delivered", "cancelled", "returned"], default: "pending" }
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const random = Math.floor(1000 + Math.random() * 9000); 
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    this.orderNumber = `ORD-${date}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);