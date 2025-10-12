const express = require("express");
const router = express.Router();
const {createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder} = require('../controllers/order')
const authMiddleware = require("../middleware/auth"); 

router.post("/", createOrder); 

router.get("/", getAllOrders);

router.get("/:id", getOrderById);

router.put("/:id/status",  updateOrderStatus);

router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;