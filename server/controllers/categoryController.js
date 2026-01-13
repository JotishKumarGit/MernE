import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";

/* ================= CREATE CATEGORY ================= */
export const createCategory = async (req, res) => {
  try {
    const { name, description, isPopular } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Category image is required" });
    }

    const category = await Category.create({
      name,
      description,
      image: `/uploads/${req.file.filename}`,
      isPopular: Boolean(isPopular),
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL CATEGORIES (PAGINATED) ================= */
export const getAllCategories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Category.countDocuments();

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      categories,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE CATEGORY ================= */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      isPopular: req.body.isPopular,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= POPULAR CATEGORIES (FOR MEGA MENU) ================= */
export const getPopularCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isPopular: true })
      .sort({ name: 1 })
      .select("name image");

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get mega menu
export const getMegaMenu = async (req, res) => {
  try {
    const categories = await Category.find({ isPopular: true })
      .sort({ order: 1 })
      .select("name slug");

    const menu = [];

    for (let cat of categories) {
      const subCategories = await SubCategory.find({ category: cat._id })
        .select("name slug");

      const subData = [];

      for (let sub of subCategories) {
        const products = await Product.find({ subCategory: sub._id })
          .select("name price image")
          .limit(4);

        subData.push({
          _id: sub._id,
          name: sub.name,
          slug: sub.slug,
          products,
        });
      }

      menu.push({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        subCategories: subData,
      });
    }

    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

