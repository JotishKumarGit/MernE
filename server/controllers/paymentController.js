import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

/* =====================================================
   CREATE RAZORPAY ORDER
===================================================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // convert rupees to paise
    const amount = Math.round(order.totalAmount * 100);

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${order._id}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================================
   VERIFY PAYMENT
===================================================== */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "paid") return res.status(200).json({ message: "Order already paid", order });

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    order.status = "paid";
    order.paymentInfo = { razorpay_order_id, razorpay_payment_id, razorpay_signature, paidAt: new Date() };
    await order.save();

    await Cart.findOneAndUpdate({ user: order.user }, { items: [], totalPrice: 0 });

    // Populate subCategory for frontend
    const populatedOrder = await Order.findById(order._id)
      .populate("orderItems.product", "name price image category subCategory")
      .populate("user", "name email");

    res.status(200).json({ message: "Payment verified & order confirmed", order: populatedOrder });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   RAZORPAY WEBHOOK
===================================================== */
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(body);
    console.log("Razorpay Webhook:", event.event);

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
