import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  users: [],
  usersLoading: false,

  fetchUsers: async (params = {}) => {
    set({ usersLoading: true });
    try {
      const res = await axiosInstance.get("/admin/users", { params });
      set({ users: res.data.users || [] });
      return res.data;
    } catch (err) {
      console.error("fetchUsers", err);
      toast.error("Failed to fetch users");
      throw err;
    } finally {
      set({ usersLoading: false });
    }
  },

  fetchUser: async (id) => {
    try {
      const res = await axiosInstance.get(`/admin/users/${id}`);
      return res.data.user;
    } catch (err) {
      console.error("fetchUser", err);
      toast.error("Failed to fetch user");
      throw err;
    }
  },

  createUser: async (payload) => {
    try {
      const res = await axiosInstance.post("/admin/users", payload);
      // append to users if present
      set((state) => ({ users: [res.data.user, ...state.users] }));
      toast.success("User created");
      return res.data.user;
    } catch (err) {
      console.error("createUser", err);
      toast.error("Failed to create user");
      throw err;
    }
  },

  updateUser: async (id, payload) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}`, payload);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? res.data.user : u)),
      }));
      toast.success("User updated");
      return res.data.user;
    } catch (err) {
      console.error("updateUser", err);
      toast.error("Failed to update user");
      throw err;
    }
  },

  deleteUser: async (id) => {
    // optimistic update example
    const prev = get().users;
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      return true;
    } catch (err) {
      // rollback
      set({ users: prev });
      console.error("deleteUser", err);
      toast.error("Failed to delete user");
      throw err;
    }
  },

  // example: manage stores
  fetchStores: async () => {
    try {
      const res = await axiosInstance.get("/admin/stores");
      return res.data.stores;
    } catch (err) {
      toast.error("Failed to fetch stores");
      throw err;
    }
  },

  // other admin-specific endpoints ...
}));
