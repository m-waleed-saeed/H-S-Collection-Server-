const express = require("express");
const router = express.Router();
const Order = require("../models/order")
const Product = require("../models/product");
const sendEmail = require("../utils/email.js");
const dotenv = require("dotenv");
dotenv.config();
const { verifyToken } = require("../middleware/auth");

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
router.get("/", verifyToken, async (req, res) => {
    try {
        const { status, search, type } = req.query;

        const page = parseInt(req.query.pageNo) || 1;
        const limit = parseInt(req.query.perPage) || 10;
        const skip = (page - 1) * limit;
        const query = {};

        if (status && status !== "all") { query.status = status; }

        if (type) { query.type = type; }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: "i" } },
                { "shippingAddress.name": { $regex: search, $options: "i" } },
            ];
        }

        const orders = await Order.find(query).populate("user", "name email").populate("products.product", "title images sizes price").skip(skip).limit(limit).sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        const totalPending = await Order.countDocuments({ status: "pending" })
        const totalDelievred = await Order.countDocuments({ status: "delivered" })
        const totalCancelled = await Order.countDocuments({ status: "cancelled" })

        const formattedOrders = orders.map((order) => ({
            ...order._doc,
            customerName: order.user ? order.user.name : order.shippingAddress?.name,
            customerEmail: order.user ? order.user.email : order.shippingAddress?.email,
        }));

        res.status(200).json({ success: true, data: formattedOrders, total, page, limit, totalPending, totalDelievred, totalCancelled });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message, });
    }
});

// Abandoned Order
router.post("/abandoned", async (req, res) => {
    try {
        const body = { ...req.body, type: "abandoned" };
        if (body._id) {
            const updated = await Order.findByIdAndUpdate(body._id, body, { new: true, runValidators: true });
            if (!updated) {
                const created = await Order.create(body);
                return res.status(201).json({ success: true, order: created });
            }
            return res.status(200).json({ success: true, order: updated });
        } else {
            const created = await Order.create(body);
            return res.status(201).json({ success: true, order: created });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to save abandoned order" });
    }
});

// Confirm Order
router.put("/:id/confirm", async (req, res) => {
    const session = await Product.startSession();
    try {
        session.startTransaction();

        const orderId = req.params.id;
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.type === "confirmed") {
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ success: true, message: "Order already confirmed", order });
        }

        for (const item of order.products) {
            const prod = await Product.findById(item.product).session(session);
            if (!prod) throw new Error(`Product not found(${item.product})`);

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

        order.type = "confirmed";
        const saved = await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🛍️ New Order Received - ${saved.orderNumber || saved._id}`,
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
                    <div class="order-id">Order #${saved.orderNumber || saved._id}</div>
                    <div class="order-type">${saved.type}</div>
                </div>
                
                <div class="customer-info">
                    <div class="info-group">
                        <div class="info-label">Total Products</div>
                        <div class="info-value">${saved.products.length} item${saved.products.length !== 1 ? 's' : ''}</div>
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

        res.status(200).json({ success: true, message: "Order confirmed successfully", order: saved });
    } catch (error) {
        try {
            await session.abortTransaction();
        } catch (e) {
            console.error("ORDER-CONTROLLER-ERR:", error.stack || error);
            try { await session.abortTransaction(); } catch (e) { }
            session.endSession();
            res.status(500).json({ message: error.message || "Failed to save order", success: false, });
        }
        session.endSession();
        res.status(500).json({ success: false, message: error.message || "Failed to confirm order" });
    }
});

// Get my Orders
router.get('/my-orders', async (req, res) => {
    try {
        let { ids, uid } = req.query;

        let query;

        if (ids !== "null" && ids !== "undefind" && ids?.length > 0) { query = { $in: { _id: ids } } }

        if (uid !== "null" && uid !== "undefind") { query = { user: uid } }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('products.product', 'title images sizes stitchedPrice unstitchedPrice')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
    }
})

// Update Status
router.put("/:id/status", verifyToken, async (req, res) => {
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
