const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, } = require("../controllers/order");

// Place Order
router.post("/", createOrder);
// Get All Orders
router.get("/", getAllOrders);
// Get Single Order by ID
router.get("/:id", getOrderById);
// Update Order Status
router.put("/status/:id", updateOrderStatus); 
// Delete Order
router.delete("/:id", deleteOrder);

module.exports = router;
