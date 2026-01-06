import Product from '../models/Product.js';
import Category from '../models/Category.js';

// create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // ✅ Create product with image path
    const product = new Product({
      name,description,price,stock,category,
      image: `/uploads/${req.file.filename}`,
      createdBy: req.user._id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all products with search, filter, pagination, sorting
export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
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

    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : 0;

    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : Number.MAX_SAFE_INTEGER;

    const ratingFilter = req.query.minRating
      ? { averageRating: { $gte: Number(req.query.minRating) } }
      : {};

    let sort = {};
    if (req.query.sort === "priceAsc") sort.price = 1;
    else if (req.query.sort === "priceDesc") sort.price = -1;
    else if (req.query.sort === "newest") sort.createdAt = -1;
    else if (req.query.sort === "oldest") sort.createdAt = 1;

    const filterQuery = {
      ...keyword,
      ...categoryFilter,
      price: { $gte: minPrice, $lte: maxPrice },
      ...ratingFilter,
    };

    const totalProducts = await Product.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    const products = await Product.find(filterQuery)
      .populate("createdBy", "name email")
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      totalProducts,
      currentPage: page,
      totalPages,
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

    // If a new image is uploaded
    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("category", "name description");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete product by ID (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
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

