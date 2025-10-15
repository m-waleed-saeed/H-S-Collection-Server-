const Order = require("../models/order");
const Product = require("../models/product");

const createOrder = async (req, res) => {
  const session = await Product.startSession();
  session.startTransaction();

  try {
    const { products, type, _id } = req.body;

    // 🟢 If abandoned order already exists and we’re confirming it
    if (_id && type === "confirmed") {
      const updatedOrder = await Order.findByIdAndUpdate(
        _id,
        { type: "confirmed" },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Order confirmed successfully",
        order: updatedOrder,
      });
    }

    // 🟡 Otherwise handle new (abandoned or confirmed) order creation
    for (const item of products) {
      const prod = await Product.findById(item.product).session(session);
      if (!prod) throw new Error("Product not found");

      if (item.stitchType === "Stitched" && item.customSize) {
        if (prod.unstitchedQuantity < item.quantity) {
          throw new Error(`Not enough unstitched stock for custom size in ${prod.title}`);
        }
        prod.unstitchedQuantity -= item.quantity;
      } else if (item.stitchType === "Stitched" && item.size) {
        const sizeObj = prod.sizes.find((s) => s.size === item.size);
        if (!sizeObj) throw new Error(`Size ${item.size} not available for product ${prod.title}`);
        if (sizeObj.quantity < item.quantity) {
          throw new Error(`Not enough stock for size ${item.size} in ${prod.title}`);
        }
        sizeObj.quantity -= item.quantity;
      } else if (item.stitchType === "Unstitched") {
        if (prod.unstitchedQuantity < item.quantity) {
          throw new Error(`Not enough unstitched stock for ${prod.title}`);
        }
        prod.unstitchedQuantity -= item.quantity;
      }

      await prod.save({ session });
    }

    const order = new Order({ ...req.body, type: type || "abandoned" });
    const savedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order saved successfully",
      success: true,
      order: savedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error); // 👈 Add this line

    session.endSession();
    res.status(500).json({
      message: error.message || "Failed to save order",
      success: false,
    });
  }
};

// ✅ controllers/orderController.js
const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const { status, search, type } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query).populate("user", "name email").populate("products.product", "title images sizes price").skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    const formattedOrders = orders.map((order) => ({
      ...order._doc,
      customerName: order.user ? order.user.name : order.shippingAddress?.name,
      customerEmail: order.user ? order.user.email : order.shippingAddress?.email,
    }));

    res.status(200).json({ success: true, data: formattedOrders, total, page, limit, });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message, });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "title images sizes stitchedPrice unstitchedPrice");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // enrich each order product with product size info
    const formattedProducts = order.products.map((p) => {
      let matchedSize = null;
      if (p.size && p.product?.sizes) {
        matchedSize = p.product.sizes.find((s) => s.size === p.size);
      }

      return {
        ...p.toObject(),
        product: p.product,
        sizeDetails: matchedSize || null, // size info from product (if any)
      };
    });

    const formattedOrder = {
      ...order.toObject(),
      products: formattedProducts,
      customerName: order.user ? order.user.name : order.shippingAddress.name,
      customerEmail: order.user ? order.user.email : order.shippingAddress.email,
    };

    res.status(200).json({ success: true, order: formattedOrder });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      success: false,
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required", success: false });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated successfully", success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", success: false, error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete order", error: error.message });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, };

