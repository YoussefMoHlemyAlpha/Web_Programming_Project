import { DeliveryManModel } from "../models/deliveryMan.model.js";
import { OrderModel } from "../models/order.model.js";

// Add a new delivery man
export const createDeliveryMan = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    // match password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if(phone.length !== 11) {
        return res.status(400).json({ message: "Phone number must be 11 digits long" });
    }
    

    // Hash password
    const bcrypt = await import("bcryptjs");
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash(password, salt);

    const newMan = new DeliveryManModel({
      name,
      phone,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword
    });
    await newMan.save();

    // Don't send password back in response
    const { password: _, confirmPassword: __, ...deliveryManData } = newMan._doc;
    res.status(201).json(deliveryManData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending orders (status: "pending") for delivery men
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find({ status: "pending" })
      .populate("userId", "firstName lastName phone")
      .sort({ createdAt: 1 }); // Oldest first
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery man accepts an order
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryManId = req.user.id; // From JWT middleware

    // 1. Check if delivery man is already busy
    const { DeliveryManModel } = await import("../models/deliveryMan.model.js");
    const deliveryMan = await DeliveryManModel.findById(deliveryManId);

    if (!deliveryMan) {
      return res.status(404).json({ message: "Delivery man not found" });
    }

    if (deliveryMan.status === "busy") {
      return res.status(400).json({ message: "You already have an active delivery" });
    }

    // 2. Update Delivery Man status
    deliveryMan.status = "busy";
    deliveryMan.currentOrderId = orderId;
    await deliveryMan.save();

    // 3. Update Order
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "onTheWay",
        deliveryManId: deliveryManId
      },
      { new: true }
    ).populate("userId", "firstName lastName phone");

    if (!order) {
      // Rollback delivery man status if order not found
      deliveryMan.status = "available";
      deliveryMan.currentOrderId = null;
      await deliveryMan.save();
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery man marks order as delivered
export const markAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryManId = req.user.id;

    // 1. Find the order and verify it belongs to this delivery man
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.deliveryManId.toString() !== deliveryManId) {
      return res.status(403).json({ message: "This order is not assigned to you" });
    }

    // 2. Update Order Status
    order.status = "delivered";
    await order.save();

    // 3. Update Delivery Man Status
    const { DeliveryManModel } = await import("../models/deliveryMan.model.js");
    await DeliveryManModel.findByIdAndUpdate(deliveryManId, {
      status: "available",
      currentOrderId: null
    });

    res.status(200).json({ message: "Order marked as delivered", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all delivery men
export const getAllDeliveryMen = async (req, res) => {
  try {
    const men = await DeliveryManModel.find();
    res.status(200).json(men);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery man's active order
export const getMyActiveOrder = async (req, res) => {
  try {
    const deliveryManId = req.user.id;

    // Find order that is assigned to this delivery man and is "onTheWay"
    const order = await OrderModel.findOne({
      deliveryManId: deliveryManId,
      status: "onTheWay"
    }).populate("userId", "firstName lastName phone");

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign an available delivery man to an order
export const assignDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Find an available delivery man
    const deliveryMan = await DeliveryManModel.findOne({ status: "available" });

    if (!deliveryMan) {
      return res.status(404).json({ message: "No available delivery men at the moment." });
    }

    // 2. Update Delivery Man
    deliveryMan.status = "busy";
    deliveryMan.currentOrderId = orderId;
    await deliveryMan.save();

    // 3. Update Order
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: "onTheWay",
        deliveryManId: deliveryMan._id
      },
      { new: true }
    );

    res.status(200).json({ message: "Delivery assigned", order, deliveryMan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark delivery as complete
export const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Find the order to get the delivery man ID
    const order = await OrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 2. Update Order Status
    order.status = "delivered";
    await order.save();

    // 3. Update Delivery Man Status
    if (order.deliveryManId) {
      await DeliveryManModel.findByIdAndUpdate(order.deliveryManId, {
        status: "available",
        currentOrderId: null
      });
    }

    res.status(200).json({ message: "Order delivered successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
