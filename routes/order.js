const express = require("express");
const router = express.Router();
const Order = require("../models/order")
const Product = require("../models/product");
const sendEmail = require("../utils/email.js");
const dotenv = require("dotenv");
const { verifyToken } = require("../middleware/auth");
dotenv.config();

// Create Order
router.post("/", async (req, res) => {
    const session = await Product.startSession();
    try {
        session.startTransaction();

        const { products, type } = req.body;

        if (type === "confirmed") {
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
        }

        const order = nesavedOrder = await order.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Order saved successfully", success: true, savedOrder, });
    } catch (error) {
        try {
            await session.abortTransaction();
        } catch (e) { }
        session.endSession();
        res.status(500).json({ message: error.message || "Failed to save order", success: false, });
    }
});

// Get All Orders
router.get("/all", verifyToken, async (req, res) => {
    try {
        const { orderNo, type, status } = req.query;

        const page = parseInt(req.query.pageNo) || 1;
        const limit = parseInt(req.query.perPage) || 10;
        const skip = (page - 1) * limit;

        const query = {};

        if (status && status !== "null" && status !== "undefined") { query.status = status; }

        if (type) { query.type = type; }

        if (orderNo && orderNo !== "null" && orderNo !== "undefined") {
            query.orderNumber = { $regex: orderNo, $options: "i" };
        }

        const orders = await Order.find(query).populate("user", "name email").populate("products.product", "title images sizes price").skip(skip).limit(limit).sort({ createdAt: -1 });
        // const orders = await Order.find(query).sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        const totalPending = await Order.countDocuments({ status: "pending" })
        const totalDelievred = await Order.countDocuments({ status: "delivered" })
        const totalCancelled = await Order.countDocuments({ status: "cancelled" })

        const formattedOrders = orders.map((order) => ({
            ...order._doc,
            customerName: order.user ? order.user.name : order.shippingAddress?.name,
            customerEmail: order.user ? order.user.email : order.shippingAddress?.email,
        }));

        res.status(200).json({ success: true, formattedOrders, total, page, limit, totalPending, totalDelievred, totalCancelled });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message, });
    }
});

// Order Place
router.post("/order-place", async (req, res) => {
    try {
        const { products, ...orderData } = req.body;
        if (!products?.length) return res.status(400).json({ message: "No products provided", isError: true });

        await Promise.all(
            products.map(async ({ product, quantity, size, stitchType, customSize }) => {
                const prod = await Product.findById(product);
                if (!prod) throw new Error(`Product not found: ${product}`);

                if (stitchType === "Stitched" && size) {
                    const sizeObj = prod.sizes.find((s) => s.size === size);
                    if (!sizeObj) throw new Error(`Size '${size}' not found for '${prod.title}'`);
                    if (sizeObj.quantity < quantity) throw new Error(`Insufficient stock for size '${size}'`);
                    sizeObj.quantity -= quantity;
                } else if ((stitchType === "Stitched" && customSize) || stitchType === "Unstitched") {
                    if (prod.unstitchedQuantity < quantity) throw new Error(`Insufficient unstitched stock for '${prod.title}'`);
                    prod.unstitchedQuantity -= quantity;
                }
                await prod.save();
            })
        );

        const order = await new Order({ ...orderData, products }).save();

        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🛍️ New Order Received - ${order.orderNumber || order._id}`,
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: sans-serif;
            background-color: #F3F4F6;
            color: #1E293B;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            background: #1551b9;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 600;
            margin: 0;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .order-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #E2E8F0;
        }
        
        .order-id {
            font-size: 20px;
            font-weight: 600;
            color: #1E293B;
        }
        
        .order-type {
            background: #1551b9;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .customer-info {
            margin-bottom: 25px;
        }
        
        .info-group {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-size: 12px;
            color: #6B7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 14px;
            color: #1E293B;
            font-weight: 500;
        }
        
        .footer {
            background: #F8FAFC;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
        }
        
        .footer-text {
            color: #6B7280;
            font-size: 12px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            
            .order-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>New Order Received</h1>
        </div>
        
        <div class="content">
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Order #${order.orderNumber || order._id}</div>
                    <div class="order-type">${order.type}</div>
                </div>
                
                <div class="customer-info">
                    <div class="info-group">
                        <div class="info-label">Total Products</div>
                        <div class="info-value">${order.products.length} item${order.products.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                
                <p style="color: #6B7280; font-size: 14px;">
                    Complete product details and order information are available in your admin dashboard.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                This is an automated notification. Please check your admin dashboard for complete order details.
            </p>
        </div>
    </div>
    </body>
    </html>
`,
        });

        res.status(201).json({ message: "Order placed successfully", isError: false, order });
    } catch (error) {
        console.error("Order Error:", error.message);
        res.status(500).json({ message: error.message || "Error placing order", isError: true });
    }
});

// Get my Orders
router.get("/my-orders", async (req, res) => {
    try {
        const { guestId } = req.query;
        if (!guestId) return res.status(400).json({ success: false, message: "User or guest ID required" });

        const query =
            guestId && guestId !== "null" && guestId !== "undefined"
            && { user: guestId, status: "pending" }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        res.json({ success: true, message: orders.length ? "Orders fetched successfully" : "No orders found", orders, });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
    }
});

// Update Status
router.put("/:id/status", async (req, res) => {
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
});

// Delete Order
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete order", error: error.message });
    }
});

module.exports = router;
