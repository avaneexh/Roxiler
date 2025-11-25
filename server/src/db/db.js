// src/db/db.js
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";

import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import ws from "ws";

// create serverless pool (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// create the adapter from the pool
const adapter = new PrismaNeon({ pool });

// Construct PrismaClient WITH adapter
const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
export default db;
