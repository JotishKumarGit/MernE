import express from 'express';
import { createCategory, deleteCategory, getAllCategories, getCategoriesWithProducts, getCategoryById, updateCategory } from '../controllers/categoryController.js';
import { protect ,adminOnly} from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// public routes for everyone
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get("/with-products", getCategoriesWithProducts);

// protected routes only for admin 
router.post("/",protect,adminOnly,upload.single("image"),createCategory);
router.put("/:id",protect,adminOnly,upload.single("image"),updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);


export default router;



