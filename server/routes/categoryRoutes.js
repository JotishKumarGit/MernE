import express from "express";
import { createCategory, deleteCategory, getMegaMenu,getAllCategories, getCategoryById,updateCategory,} from "../controllers/categoryController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// ================= PUBLIC =================
router.get("/", getAllCategories);
router.get("/mega-menu", getMegaMenu);
router.get("/:id", getCategoryById);

// ================= ADMIN =================
router.post("/", protect, adminOnly, upload.single("image"), createCategory);
router.put("/:id", protect, adminOnly, upload.single("image"), updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
