import { create } from "zustand";
import { axiosInstance } from "../lib/axios";



const API_BASE = "/admin"; // change to '/api/admin' if needed

export const useAdminStore = create((set, get) => ({
  // Admin dashboard
  dashboardStats: { totalUsers: 0, totalStores: 0, totalRatings: 0 },

  // Users
  users: [],
  usersMeta: { total: 0, count: 0, page: 1, perPage: 20 },
  currentUser: null,

  // Stores
  stores: [],
  storesMeta: { total: 0, count: 0, page: 1, perPage: 20 },

  // Ratings
  ratings: [],
  ratingsCount: 0,

  // ui
  loading: false,
  error: null,

  // setters
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clear: () =>
    set({
      dashboardStats: { totalUsers: 0, totalStores: 0, totalRatings: 0 },
      users: [],
      usersMeta: { total: 0, count: 0, page: 1, perPage: 20 },
      currentUser: null,
      stores: [],
      storesMeta: { total: 0, count: 0, page: 1, perPage: 20 },
      ratings: [],
      ratingsCount: 0,
      loading: false,
      error: null,
    }),

  // fetch admin dashboard stats
  fetchDashboardStats: async (opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/dashboard`);
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to fetch stats");
      set({ dashboardStats: data.stats ?? { totalUsers: 0, totalStores: 0, totalRatings: 0 }, loading: false });
      return data.stats;
    } catch (err) {
      console.error("fetchDashboardStats error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch users with optional query params: { name, email, address, role, sortBy, sortOrder, page, limit }
  fetchUsers: async (query = {}, opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/users`, { params: query });
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to fetch users");
      set({
        users: data.users ?? [],
        usersMeta: {
          total: data.total ?? 0,
          count: data.count ?? (data.users ?? []).length,
          page: data.page ?? (query.page ? Number(query.page) : 1),
          perPage: data.perPage ?? (query.limit ? Number(query.limit) : 20),
        },
        loading: false,
        error: null,
      });
      return { users: data.users ?? [], meta: get().usersMeta };
    } catch (err) {
      console.error("fetchUsers error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch single user by id
  fetchUserById: async (id, opts = {}) => {
    const { withLoader = true } = opts;
    if (!id) throw new Error("User id is required");
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/users/${id}`);
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to fetch user");
      set({ currentUser: data.user ?? null, loading: false, error: null });
      return data.user;
    } catch (err) {
      console.error("fetchUserById error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // create a user (admin action)
  createUser: async (payload = {}, opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.post(`${API_BASE}/users`, payload);
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to create user");
      // optionally prepend to users list if page shows first page
      set((state) => ({
        users: [data.user, ...state.users].slice(0, state.usersMeta.perPage || 20),
        loading: false,
        error: null,
      }));
      return data.user;
    } catch (err) {
      console.error("createUser error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch stores with optional query params: { name, email, address, sortBy, sortOrder, page, limit }
  fetchStores: async (query = {}, opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/stores`, { params: query });
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to fetch stores");
      set({
        stores: data.stores ?? [],
        storesMeta: {
          total: data.total ?? 0,
          count: data.count ?? (data.stores ?? []).length,
          page: data.page ?? (query.page ? Number(query.page) : 1),
          perPage: data.perPage ?? (query.limit ? Number(query.limit) : 20),
        },
        loading: false,
        error: null,
      });
      return { stores: data.stores ?? [], meta: get().storesMeta };
    } catch (err) {
      console.error("fetchStores error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // create store (admin action) - payload should match your controller expectations
  createStore: async (payload = {}, opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.post(`${API_BASE}/stores`, payload);
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to create store");
      // optionally add to stores list
      set((state) => ({
        stores: [data.store, ...state.stores].slice(0, state.storesMeta.perPage || 20),
        loading: false,
        error: null,
      }));
      return { store: data.store, owner: data.owner };
    } catch (err) {
      console.error("createStore error:", err);
      set({ loading: false, error: err?.response?.data || err.message || err });
      throw err;
    }
  },

  // fetch all ratings (admin)
  fetchRatings: async (query = {}, opts = {}) => {
    const { withLoader = true } = opts;
    try {
      if (withLoader) set({ loading: true, error: null });
      const res = await axiosInstance.get(`${API_BASE}/ratings`, { params: query });
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to fetch ratings");
      set({
        ratings: data.ratings ?? [],
        ratingsCount: data.count ?? (data.ratings ?? []).length,
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
