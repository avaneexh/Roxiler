import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  // state
  profile: null,
  profileLoading: false,

  orders: [],
  ordersLoading: false,

  wallet: null,
  walletLoading: false,

  favorites: [],
  favoritesLoading: false,

  // --- profile ---
  fetchProfile: async () => {
    set({ profileLoading: true });
    try {
      const res = await axiosInstance.get("/user/profile");
      set({ profile: res.data.user ?? res.data });
      return res.data;
    } catch (err) {
      console.error("fetchProfile", err);
      toast.error("Failed to load profile");
      throw err;
    } finally {
      set({ profileLoading: false });
    }
  },

  updateProfile: async (payload) => {
    set({ profileLoading: true });
    try {
      const res = await axiosInstance.put("/user/profile", payload);
      set({ profile: res.data.user ?? res.data });
      toast.success("Profile updated");
      return res.data;
    } catch (err) {
      console.error("updateProfile", err);
      toast.error("Failed to update profile");
      throw err;
    } finally {
      set({ profileLoading: false });
    }
  },

  // --- orders ---
  fetchOrders: async (params = {}) => {
    set({ ordersLoading: true });
    try {
      const res = await axiosInstance.get("/user/orders", { params });
      set({ orders: res.data.orders ?? res.data });
      return res.data;
    } catch (err) {
      console.error("fetchOrders", err);
      toast.error("Failed to load orders");
      throw err;
    } finally {
      set({ ordersLoading: false });
    }
  },

  fetchOrder: async (orderId) => {
    try {
      const res = await axiosInstance.get(`/user/orders/${orderId}`);
      return res.data.order ?? res.data;
    } catch (err) {
      console.error("fetchOrder", err);
      toast.error("Failed to load order");
      throw err;
    }
  },

  // Example: cancel order
  cancelOrder: async (orderId) => {
    // optimistic update: mark cancelled locally then revert on error
    const prev = get().orders;
    set((s) => ({ orders: s.orders.map(o => o.id === orderId ? { ...o, status: "cancelling" } : o) }));
    try {
      const res = await axiosInstance.post(`/user/orders/${orderId}/cancel`);
      // replace updated order if returned
      if (res.data?.order) {
        set((s) => ({ orders: s.orders.map(o => o.id === orderId ? res.data.order : o) }));
      }
      toast.success("Order cancellation requested");
      return res.data;
    } catch (err) {
      set({ orders: prev }); // rollback
      console.error("cancelOrder", err);
      toast.error("Failed to cancel order");
      throw err;
    }
  },

  // --- wallet ---
  fetchWallet: async () => {
    set({ walletLoading: true });
    try {
      const res = await axiosInstance.get("/user/wallet");
      set({ wallet: res.data.wallet ?? res.data });
      return res.data;
    } catch (err) {
      console.error("fetchWallet", err);
      toast.error("Failed to load wallet");
      throw err;
    } finally {
      set({ walletLoading: false });
    }
  },

  // --- favorites / wishlist ---
  fetchFavorites: async () => {
    set({ favoritesLoading: true });
    try {
      const res = await axiosInstance.get("/user/favorites");
      set({ favorites: res.data.items ?? res.data });
      return res.data;
    } catch (err) {
      console.error("fetchFavorites", err);
      toast.error("Failed to load favorites");
      throw err;
    } finally {
      set({ favoritesLoading: false });
    }
  },

  addFavorite: async (item) => {
    // optimistic UI: add locally then call api
    const prev = get().favorites;
    set((s) => ({ favorites: [item, ...s.favorites] }));
    try {
      const res = await axiosInstance.post("/user/favorites", { itemId: item.id ?? item });
      toast.success("Added to favorites");
      // optionally replace with server object
      return res.data;
    } catch (err) {
      set({ favorites: prev }); // rollback
      console.error("addFavorite", err);
      toast.error("Failed to add favorite");
      throw err;
    }
  },

  removeFavorite: async (itemId) => {
    const prev = get().favorites;
    set((s) => ({ favorites: s.favorites.filter((f) => (f.id ?? f) !== itemId) }));
    try {
      await axiosInstance.delete(`/user/favorites/${itemId}`);
      toast.success("Removed from favorites");
      return true;
    } catch (err) {
      set({ favorites: prev }); // rollback
      console.error("removeFavorite", err);
      toast.error("Failed to remove favorite");
      throw err;
    }
  },

  // --- misc user endpoints ---
  changePassword: async (payload) => {
    try {
      const res = await axiosInstance.post("/user/change-password", payload);
      toast.success("Password changed");
      return res.data;
    } catch (err) {
      console.error("changePassword", err);
      toast.error("Failed to change password");
      throw err;
    }
  },

  // clear user store (useful on logout)
  clearUserStore: () => {
    set({
      profile: null,
      orders: [],
      wallet: null,
      favorites: [],
    });
  },
}));
