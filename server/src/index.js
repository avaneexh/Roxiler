import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from './routes/authRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import storeOwnerRoutes from "./routes/storeOwnerRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

const WHITELIST = [
  "https://roxiler-kappa.vercel.app",
  "http://localhost:5173" 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (WHITELIST.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With","jwt"],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"]
}));

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return res.sendStatus(204);
});

app.use((req, res, next) => {
  console.log("REQ ->", req.method, req.originalUrl, "Origin:", req.get("Origin"));
  next();
});

app.get("/", (req, res) => {
  res.send("Hello From Roxiler🔥🔥");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/store", storeOwnerRoutes);
app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
export default app;