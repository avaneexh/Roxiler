import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  getAllStores,
  createStore,
  getAllRatings,
} from '../controllers/adminController.js';
import { authMiddleware, checkAdmin } from "../middleware/authMiddlewares.js";

const adminRoutes = express.Router();


// Dashboard
adminRoutes.get('/dashboard',authMiddleware, checkAdmin, getDashboardStats);

// Users
adminRoutes.get('/users', authMiddleware, checkAdmin, getAllUsers);
adminRoutes.get('/users/:id', authMiddleware, checkAdmin, getUserById);
adminRoutes.post('/users', authMiddleware, checkAdmin, createUser);

// Stores
adminRoutes.get('/stores', authMiddleware, checkAdmin, getAllStores);
adminRoutes.post('/stores', authMiddleware, checkAdmin, createStore);

// Ratings
adminRoutes.get('/ratings', authMiddleware, checkAdmin, getAllRatings);

export default adminRoutes;