import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

/* ================= CREATE SUB CATEGORY ================= */
export const createSubCategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and Category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Sub category image is required" });
    }

    // check category exists
    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: "Main category not found" });
    }

    const subCategory = await SubCategory.create({
      name,
      description,
      category,
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= GET ALL SUB CATEGORIES (PAGINATION) ================= */
export const getAllSubCategories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await SubCategory.countDocuments();

    const subCategories = await SubCategory.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      subCategories,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SUB CATEGORIES BY CATEGORY ================= */
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.find({
      category: categoryId,
    });

    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================= GET SINGLE SUB CATEGORY ================= */
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate("category", "name");

    if (!subCategory) {
      return res.status(404).json({ message: "Sub category not found" });
    }

    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE SUB CATEGORY ================= */
export const updateSubCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({ message: "Sub category not found" });
    }

    res.status(200).json(subCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE SUB CATEGORY ================= */
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: "Sub category not found" });
    }

    res.status(200).json({ message: "Sub category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
