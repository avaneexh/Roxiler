import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  profile: null,
  profileLoading: false,

  orders: [],
  ordersLoading: false,

  wallet: null,
  walletLoading: false,

  favorites: [],
  favoritesLoading: false,

  stores: [], 
  storesLoading: false,
  page: 1,
  perPage: 20,
  totalCount: 0,

  myRatings: [],  
  myRatingsLoading: false,


  fetchStores: async ({ page = 1, limit = 20, q = "" } = {}) => {
    set({ storesLoading: true, page, perPage: limit });
    try {
      const params = { page, limit };
      if (q) params.q = q;
      // console.log("stores calling", params);
      
      const res = await axiosInstance.get("/user/stores", { params });
      const data = res.data ?? {};
      const stores = data.stores ?? [];
      set({
        stores,
        totalCount: data.count ?? stores.length,
        page: data.page ?? page,
        perPage: data.perPage ?? limit,
      });
      return data;
    } catch (err) {
      console.error("fetchStores error:", err);
      toast.error(err?.response?.data?.message || "Failed to load stores");
      throw err;
    } finally {
      set({ storesLoading: false });
    }
  },

  rateStore: async (storeId, { rating, comment = null }) => {
    const prevStores = get().stores;
    const prevMyRatings = get().myRatings;

    set((state) => ({
      stores: state.stores.map((s) =>
        s.id === storeId ? { ...s, user_rating: rating, user_comment: comment } : s
      ),
    }));

    try {
      const res = await axiosInstance.post(`/user/stores/${storeId}/rate`, { rating, comment });
      toast.success(res.data?.message || "Rating submitted");

      try {
        await get().fetchMyRatings();
      } catch (e) {
        // silently ignore
      }


      return res.data;
    } catch (err) {
      set({ stores: prevStores, myRatings: prevMyRatings });
      console.error("rateStore error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit rating");
      throw err;
    }
  },

  fetchMyRatings: async () => {
    set({ myRatingsLoading: true });
    try {
      const res = await axiosInstance.get("/user/my-ratings");
      const data = res.data ?? {};
      const ratings = data.ratings ?? [];
      set({ myRatings: ratings });
      return data;
    } catch (err) {
      console.error("fetchMyRatings error:", err);
      toast.error(err?.response?.data?.message || "Failed to load your ratings");
      throw err;
    } finally {
      set({ myRatingsLoading: false });
    }
  },

  deleteRating: async (ratingId) => {
    const prevMyRatings = get().myRatings;
    const prevStores = get().stores;
    set((state) => ({
      myRatings: state.myRatings.filter((r) => r.id !== ratingId),
      stores: state.stores.map((s) =>
        s.user_rating_id === ratingId ? { ...s, user_rating: null, user_comment: null, user_rating_id: null } : s
      ),
    }));

    try {
      const res = await axiosInstance.delete(`/user/ratings/${ratingId}`);
      toast.success(res.data?.message || "Rating deleted");
      return res.data;
    } catch (err) {
      // rollback
      set({ myRatings: prevMyRatings, stores: prevStores });
      console.error("deleteRating error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete rating");
      throw err;
    }
  },

  refreshStoresAndRatings: async (opts = {}) => {
    try {
      await Promise.all([get().fetchStores(opts), get().fetchMyRatings()]);
      return true;
    } catch (err) {
      return false;
    }
  },

  // clear user-specific store (call on logout)
  clearUserStore: () => {
    set({
      profile: null,
      profileLoading: false,
      orders: [],
      ordersLoading: false,
      wallet: null,
      walletLoading: false,
      favorites: [],
      favoritesLoading: false,
      stores: [],
      storesLoading: false,
      page: 1,
      perPage: 20,
      totalCount: 0,
      myRatings: [],
      myRatingsLoading: false,
    });
  },
}));

export default useUserStore;
