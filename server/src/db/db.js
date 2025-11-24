import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

if (!globalForPrisma.prisma) {
  prisma.$connect()
  .then(() => console.log("📦 Prisma connected to the database successfully."))
  .catch((err) => console.error("❌ Prisma connection error:", err))
}
