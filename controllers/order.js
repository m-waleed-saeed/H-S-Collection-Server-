const Order = require("../models/order");

const createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        const savedOrder = await order.save();

        res.status(201).json({ message: "Order placed successfully", success: true, order: savedOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to place order", success: false, error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "title price");

        const formattedOrders = orders.map(order => ({ ...order._doc, customerName: order.user ? order.user.name : order.shippingAddress.name, customerEmail: order.user ? order.user.email : order.shippingAddress.email, }));

        res.status(200).json({ success: true, count: orders.length, orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders", success: false, error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("products.product", "title price");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        const formattedOrder = { ...order._doc, customerName: order.user ? order.user.name : order.shippingAddress.name, customerEmail: order.user ? order.user.email : order.shippingAddress.email, };
        res.status(200).json({ success: true, order: formattedOrder });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch order", success: false, error: error.message });
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

