// Import models
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';
import Category from '../models/Category.js';

// Get Admin Dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // Orders by status

    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const statusSummary = {};
    orderStatusCounts.forEach((item) => {
      statusSummary[item._id] = item.count;
    });

    // Recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price');

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock');

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      orderStatusSummary: statusSummary,
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📆 Monthly Revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Convert month numbers to names (optional)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const getMonthlyRevenue = monthNames.map((name, index)=>{
      const monthData = revenue.filter(r=> r._id === index + 1);
      return{
        month: name,
        totalRevenue: monthData.length ? monthData[0].totalRevenue : 0
      }
    })

    res.json(getMonthlyRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Orders by Status
export const getOrderStatuses = async (req, res) => {
  try {
    const statuses = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = {};
    statuses.forEach(s => {
      formatted[s._id] = s.count;
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔔 Low Stock Products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 5 } }, { name: 1, stock: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Top Selling Products
export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.qty" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productName: "$productDetails.name",
          unitsSold: "$totalSold"
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧮 Average Order Value (AOV)
export const getAOV = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] }
        }
      }
    ]);

    res.json(result[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate invoice PDF and send as response
export const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Fetch order details from DB (adjust based on your schema)
    const order = await Order.findById(orderId)
      .populate('user', 'name email address')  // user info
      .populate('orderItems.product', 'name price'); // product info

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const doc = new PDFDocument();

    // Set response headers for PDF file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);

    // Pipe PDF output to response
    doc.pipe(res);

    // Document Title
    doc.fontSize(20).text('Invoice', { align: 'center' });

    doc.moveDown();

    // User Details
    doc.fontSize(12).text(`Customer Name: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    // If you have address, add here

    doc.moveDown();

    // Order Info
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${order.createdAt.toDateString()}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Product', 50, doc.y);
    doc.text('Quantity', 250, doc.y);
    doc.text('Price', 350, doc.y);
    doc.text('Total', 450, doc.y);
    doc.font('Helvetica');

    doc.moveDown();

    // List each product
    order.orderItems.forEach(item => {
      doc.text(item.product.name, 50, doc.y);
      doc.text(item.qty, 250, doc.y);
      doc.text(`$${item.product.price.toFixed(2)}`, 350, doc.y);
      doc.text(`$${(item.product.price * item.qty).toFixed(2)}`, 450, doc.y);
      doc.moveDown();
    });

    doc.moveDown();

    // Total Amount
    doc.font('Helvetica-Bold').text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right' });

    // Finalize PDF file
    doc.end();

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Could not generate invoice' });
  }
};

// get all user 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // don’t send password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get Total Orders Count (Admin)
export const getTotalOrdersCount = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
