import { create } from "zustand";
import axios from "axios";

export const useCategoryStore = create((set) => ({
  megaCategories: [],  
  loading: false,

  fetchMegaCategories: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/categories/mega");
      const categories = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      set({
        megaCategories: categories,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      set({
        megaCategories: [],
        loading: false,
      });
    }
  },
}));
