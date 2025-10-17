const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true , trim: true},
    lastName: { type: String,trim: true},
    email: { type: String, unique: true, required: true,trim: true },
    password: { type: String, required: true,trim: true, select: false},
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 }
    }],
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports  = mongoose.model("User", userSchema);


