const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, } = require('../controllers/order');
const { verifyUser, verifyAdmin } = require("../middleware/auth");

// Create Order (User only)
router.post("/", createOrder);

// Get All Orders (Admin only)
router.get("/", verifyUser, verifyAdmin, getAllOrders);

// Get Order by ID (User or Admin)
router.get("/:id", getOrderById);

// Update Order Status (Admin only)
router.put("/:id/status", verifyUser, verifyAdmin, updateOrderStatus);

// Delete Order (Admin only)
router.delete("/:id", verifyUser, verifyAdmin, deleteOrder);

module.exports = router;
