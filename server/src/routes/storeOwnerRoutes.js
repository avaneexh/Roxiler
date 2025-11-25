import express from 'express';
import {
  getDashboard,
  getStore,
  getRatings
} from '../controllers/storeOwnerController.js';

import { authMiddleware } from "../middleware/authMiddlewares.js";

const storeOwnerRoutes = express.Router();

storeOwnerRoutes.get('/dashboard', authMiddleware, getDashboard);
storeOwnerRoutes.get('/store', authMiddleware, getStore);
storeOwnerRoutes.get('/ratings', authMiddleware,  getRatings);



export default storeOwnerRoutes;