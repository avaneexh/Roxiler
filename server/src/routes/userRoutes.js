import express from 'express';
import {
  getAllStores,
  rateStore,
  getMyRatings,
  deleteRating
} from '../controllers/userController.js';

import { authMiddleware } from "../middleware/authMiddlewares.js";

const userRoutes = express.Router();

userRoutes.get('/stores', authMiddleware, getAllStores);
userRoutes.post('/stores/:storeId/rate', authMiddleware, rateStore);

// User ratings
userRoutes.get('/my-ratings', authMiddleware, getMyRatings);
userRoutes.delete('/ratings/:ratingId', authMiddleware, deleteRating);

export default userRoutes;