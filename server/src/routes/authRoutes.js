import express from "express"
import { changePassword, check, login, logout, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddlewares.js";


const authRoutes = express.Router();

authRoutes.post("/register", register)

authRoutes.post("/login", login)

authRoutes.post("/logout", authMiddleware, logout)

authRoutes.get("/check", authMiddleware, check)

authRoutes.post("/changePassword", authMiddleware, changePassword)

export default authRoutes;