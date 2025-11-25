import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStoreOwnerStore = create((set, get) => ({
  inventory: [],
  orders: [],
  loading: false,

  fetchInventory: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/store/inventory");
      set({ inventory: res.data.items || [] });
      return res.data;
    } catch (err) {
      console.error("fetchInventory", err);
      toast.error("Failed to load inventory");
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (payload) => {
    try {
      const res = await axiosInstance.post("/store/inventory", payload);
      set((s) => ({ inventory: [res.data.item, ...s.inventory] }));
      toast.success("Product added");
      return res.data.item;
    } catch (err) {
      console.error("createProduct", err);
      toast.error("Failed to add product");
      throw err;
    }
  },

  updateProduct: async (id, payload) => {
    try {
      const res = await axiosInstance.put(`/store/inventory/${id}`, payload);
      set((s) => ({ inventory: s.inventory.map((it) => (it.id === id ? res.data.item : it)) }));
      toast.success("Product updated");
      return res.data.item;
    } catch (err) {
      console.error("updateProduct", err);
      toast.error("Update failed");
      throw err;
    }
  },

  deleteProduct: async (id) => {
    const prev = get().inventory;
    set((s) => ({ inventory: s.inventory.filter((it) => it.id !== id) }));
    try {
      await axiosInstance.delete(`/store/inventory/${id}`);
      toast.success("Product removed");
      return true;
    } catch (err) {
      set({ inventory: prev });
      console.error("deleteProduct", err);
      toast.error("Delete failed");
      throw err;
    }
  },

  fetchOrders: async () => {
    try {
      const res = await axiosInstance.get("/store/orders");
      set({ orders: res.data.orders || [] });
      return res.data;
    } catch (err) {
      console.error("fetchOrders", err);
      toast.error("Failed to load orders");
      throw err;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await axiosInstance.patch(`/store/orders/${orderId}`, { status });
      set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? res.data.order : o)) }));
      toast.success("Order updated");
      return res.data.order;
    } catch (err) {
      console.error("updateOrderStatus", err);
      toast.error("Failed to update order");
      throw err;
    }
  },
}));
