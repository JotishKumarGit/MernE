// controllers/orderController.js
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

/* =====================================================
   PLACE ORDER (TRANSACTION SAFE)
===================================================== */
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { orderItems, shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
        !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error("Product not found");

      const quantity = Number(item.qty || item.quantity || 0);
      if (quantity <= 0) throw new Error("Invalid quantity");

      if (product.stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      totalAmount += product.price * quantity;

      processedItems.push({
        product: product._id,
        qty: quantity,
      });
    }

    const order = await Order.create(
      [
        {
          user: userId,
          orderItems: processedItems,
          shippingAddress,
          totalAmount,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate subCategory for frontend
    const populatedOrder = await Order.findById(order[0]._id)
      .populate("orderItems.product", "name price image category subCategory")
      .populate("user", "name email");

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Place Order Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   MARK ORDER AS PAID (RAZORPAY)
===================================================== */
export const markOrderAsPaid = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update order status & payment info
    order.status = "paid";
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paidAt: new Date(),
    };
    await order.save();

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [], totalPrice: 0 }
    );

    res.status(200).json({ message: "Payment verified & order paid", order });
  } catch (error) {
    console.error("Mark Order Paid Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET MY ORDERS
===================================================== */
export const getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const totalOrders = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "name price image category subCategory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   CANCEL ORDER
===================================================== */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("orderItems.product", "name stock category subCategory");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel shipped/delivered order" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.qty;
        await product.save();
      }
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled & stock restored", order });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: GET ALL ORDERS
===================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
===================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty; // restore stock
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   GET MY ORDERS COUNT
===================================================== */
export const getMyOrdersCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalOrders = await Order.countDocuments({ user: userId });
    res.status(200).json({ totalOrders });
  } catch (error) {
    console.error("Get My Orders Count Error:", error);
    res.status(500).json({ message: error.message });
  }
};