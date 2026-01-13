import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// helper: make absolute URL for image
const makeAbsoluteImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const host = `${req.protocol}://${req.get("host")}`;
  return imagePath.startsWith("/") ? `${host}${imagePath}` : `${host}/${imagePath}`;
};
  
// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await cart.save();

    const populated = await Cart.findOne({ user: userId })
      .populate("items.product", "name price image category subCategory")
      .lean();

    populated.items.forEach(it => {
      if (it.product) it.product.image = makeAbsoluteImageUrl(req, it.product.image);
    });

    res.json(populated || { items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price image category subCategory")
      .lean();
    if (!cart) return res.json({ items: [], totalPrice: 0 });

    cart.items.forEach(it => {
      if (it.product) it.product.image = makeAbsoluteImageUrl(req, it.product.image);
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;

    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    const populated = await Cart.findOne({ user: userId }).populate("items.product").lean();
    if (populated && populated.items) {
      populated.items.forEach((it) => {
        if (it.product) it.product.image = makeAbsoluteImageUrl(req, it.product.image);
      });
    }

    res.json(populated || { items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove Item
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    await cart.save();

    const populated = await Cart.findOne({ user: userId }).populate("items.product").lean();
    if (populated && populated.items) {
      populated.items.forEach((it) => {
        if (it.product) it.product.image = makeAbsoluteImageUrl(req, it.product.image);
      });
    }

    res.json(populated || { items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();
    // return consistent empty cart structure
    res.json({ items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
