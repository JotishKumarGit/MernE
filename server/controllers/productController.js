import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';

// create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, subCategory } = req.body;

    // ✅ Validate main category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // ✅ Validate subCategory (REQUIRED)
    if (!subCategory) {
      return res.status(400).json({ message: "SubCategory is required" });
    }

    const subCategoryExists = await SubCategory.findById(subCategory);
    if (!subCategoryExists) {
      return res.status(400).json({ message: "Invalid subCategory ID" });
    }

    // ✅ Validate stock
    if (stock === undefined || stock === "") {
      return res.status(400).json({ message: "Stock is required" });
    }

    // ✅ Validate image
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // ✅ Create product
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      subCategory,
      image: `/uploads/${req.file.filename}`,
      createdBy: req.user._id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all products with search, filter, pagination, sorting
export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    const filterQuery = {
      ...keyword,
      ...categoryFilter,
    };

    const totalProducts = await Product.countDocuments(filterQuery);

    const products = await Product.find(filterQuery)
      // ✅ VERY IMPORTANT POPULATE
      .populate({
        path: "subCategory",
        select: "name",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Update product by ID (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const updatedFields = { ...req.body };

    // ✅ If image updated
    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    )
      // ✅ Populate after update
      .populate({
        path: "subCategory",
        populate: { path: "category" },
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Delete product by ID (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// create or update review 
export const createOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existingReview = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add new review
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };
      product.reviews.push(review);
    }

    // Recalculate average rating and total reviews
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.numReviews;

    await product.save();
    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get product review
export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Review (Admin Only)
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviewId = req.params.reviewId;

    product.reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== reviewId
    );

    // Recalculate
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.numReviews > 0
        ? product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.numReviews
        : 0;

    await product.save();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

