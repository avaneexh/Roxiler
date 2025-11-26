import {create} from "zustand";
import { axiosInstance } from "../lib/axios";

const API_BASE = "/store"; 

export const useStoreOwnerStore = create((set, get) => ({
  // data
  store: null,       
  stats: {            
    average_rating: 0,
    total_ratings: 0,
  },
  ratings: [],       
  count: 0,          

  // ui state
  loading: false,
  error: null,

  // actions
  setStore: (store) => set({ store }),
  setStats: (stats) => set({ stats }),
  setRatings: (ratings) => set({ ratings, count: ratings?.length ?? 0 }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  clear: () =>
    set({
      store: null,
      stats: { average_rating: 0, total_ratings: 0 },
      ratings: [],
      count: 0,
      loading: false,
      error: null,
    }),

  fetchDashboard: async (opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/dashboard`);
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch dashboard");
      }
      const d = data.data;
      set({
        store: d.store ?? null,
        stats: d.stats ?? { average_rating: 0, total_ratings: 0 },
        ratings: d.ratings ?? [],
        count: (d.ratings ?? []).length,
        loading: false,
        error: null,
      });
      return d;
    } catch (err) {
      console.error("fetchDashboard error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch store (summary)
  fetchStore: async (opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/store`);
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch store");
      }
      set({
        store: data.store ?? null,
        stats: data.store?.stats ?? { average_rating: 0, total_ratings: 0 },
        loading: false,
        error: null,
      });
      return data.store;
    } catch (err) {
      console.error("fetchStore error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch ratings list
  fetchRatings: async (opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/ratings`);
      // expected: { success: true, count, ratings }
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.message || "Failed to fetch ratings");
      }
      set({
        ratings: data.ratings ?? [],
        count: data.count ?? (data.ratings ?? []).length,
        loading: false,
        error: null,
      });
      return { ratings: data.ratings ?? [], count: data.count ?? 0 };
    } catch (err) {
      console.error("fetchRatings error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },
}));
