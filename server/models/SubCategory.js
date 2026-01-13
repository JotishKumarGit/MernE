import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sub category name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Sub category image is required"],
    },

    // 🔥 Main category reference
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate sub-category under same category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
export default SubCategory;
