import express from "express";
import {createSubCategory,getAllSubCategories,getSubCategoriesByCategory,getSubCategoryById,updateSubCategory, deleteSubCategory,} from "../controllers/subCategoryController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// Create sub category
router.post("/", protect, adminOnly, upload.single("image"), createSubCategory);

// Update sub category
router.put("/:id", protect, adminOnly, upload.single("image"), updateSubCategory);

// Delete sub category
router.delete("/:id", protect, adminOnly, deleteSubCategory);

/* ================= PUBLIC ROUTES ================= */

// Get all sub categories (pagination)
router.get("/", getAllSubCategories);

//  Get sub categories by category (MUST be before :id)
router.get("/category/:categoryId", getSubCategoriesByCategory);

// Get single sub category
router.get("/:id", getSubCategoryById);

export default router;
