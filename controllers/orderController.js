// controllers/orderController.js
const Order = require('../models/orderModel'); 
const Product = require("../models/productModel")

// Create a new order
const createOrder = async (req, res) => {
    try {
        const order = new Order(req.body); // Assuming req.body contains the necessary order data
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customer', 'name email'); // Populate customer details
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update order to paid
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order to paid:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update order to delivered
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order to delivered:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get my orders (for a specific user)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id }); // Assuming req.user contains the authenticated user
        res.json(orders);
    } catch (error) {
        console.error("Error fetching user's orders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create checkout session (optional)
const createCheckoutSession = async (req, res) => {
    // Implement your checkout logic here
};

module.exports = {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getAllOrders,
    createCheckoutSession,
};