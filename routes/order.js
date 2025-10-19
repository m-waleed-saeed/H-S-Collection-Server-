const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, getUserOrders,createAbandonedOrder,confirmOrder } = require('../controllers/order');
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// Create Order (User only)
router.post("/", createOrder);

// Get All Orders (Admin only)
router.get("/", verifyUser, verifyAdmin, getAllOrders);

//  create or update abandoned order
router.post("/abandoned", createAbandonedOrder);

//  confirm an existing order (decrements stock inside a transaction)
router.put("/:id/confirm", confirmOrder);

// Get Order by ID (User or Admin)
router.get("/:id", getOrderById);

// Get orders for a specific user (logged-in)
router.get('/user/:userId', getUserOrders)

// Update Order Status (Admin only)
router.put("/:id/status", verifyUser, verifyAdmin, updateOrderStatus);

// Delete Order (Admin only)
router.delete("/:id", verifyUser, verifyAdmin, deleteOrder);

module.exports = router;
