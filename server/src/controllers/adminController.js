import { Role } from "@prisma/client";
import jwt from "jsonwebtoken"
import  bcrypt from "bcryptjs";
import { db } from "../db/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      db.user.count(),
      db.store.count(),
      db.rating.count(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
    console.error("Error get dashboard stats:", error);
    return res.status(500).json({ error: "Error getting stats" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = "created_at",
      sortOrder = "DESC",
      page = "1",
      limit = "20",
    } = req.query;

    // parse pagination & sanitize
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    // Allow-list sortable fields so user can't inject arbitrary fields
    const ALLOWED_SORT_FIELDS = new Set([
      "created_at",
      "updated_at",
      "name",
      "email",
    ]);
    const orderField = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "created_at";
    const orderDirection = (String(sortOrder).toLowerCase() === "asc") ? "asc" : "desc";

    // Build Prisma "where" filter
    const where = {};
    if (name) where.name = { contains: String(name), mode: "insensitive" };
    if (email) where.email = { contains: String(email), mode: "insensitive" };
    if (address) where.address = { contains: String(address), mode: "insensitive" };
    if (role) where.role = role; // exact match for enum

    // Fetch total count and paginated results in parallel
    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { [orderField]: orderDirection },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          address: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      total,              // total matching records
      count: users.length, // number of users in this page
      page: pageNum,
      perPage: take,
      users,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ error: "Error fetching all users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        created_at: true,
        updated_at: true,
        // include ratings with the store (small payload)
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            created_at: true,
            store: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        stores: {
          select: {
            id: true,
            name: true,
            address: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ratingsCount = user.ratings?.length ?? 0;
    const averageRating =
      ratingsCount > 0
        ? user.ratings.reduce((s, r) => s + r.rating, 0) / ratingsCount
        : null;

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        stats: {
          ratingsCount,
          averageRating,
          storesCount: user.stores?.length ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      error: "Error fetching user",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(String(password), 10);

    // validate role — use Prisma Role enum values; default to normal_user
    const chosenRole =
      role && Object.values(Role).includes(role) ? role : Role.normal_user;

    // create user and return selected safe fields
    const user = await db.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: normalizedEmail,
        password: hashedPassword,
        address: address ? String(address).trim() : null,
        role: chosenRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        created_at: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const getAllStores = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      sortBy = "created_at",
      sortOrder = "DESC",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * take;

    // allow-list sortable fields to avoid arbitrary injection
    const ALLOWED_SORT_FIELDS = new Set([
      "created_at",
      "updated_at",
      "name",
      "email",
    ]);
    const orderField = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "created_at";
    const orderDirection = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    // Build Prisma where filter
    const where = {};
    if (name) where.name = { contains: String(name), mode: "insensitive" };
    if (email) where.email = { contains: String(email), mode: "insensitive" };
    if (address) where.address = { contains: String(address), mode: "insensitive" };

    // Fetch total and page results in parallel
    const [total, stores] = await Promise.all([
      db.store.count({ where }),
      db.store.findMany({
        where,
        orderBy: { [orderField]: orderDirection },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          description: true,
          address: true,
          created_at: true,
          updated_at: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      total,               // total matching stores
      count: stores.length, // number in this page
      page: pageNum,
      perPage: take,
      stores,
    });
  } catch (error) {
    console.error("Error fetching all stores:", error);
    return res.status(500).json({ error: "Error fetching all stores" });
  }
};

export const createStore = async (req, res, next) => {
  try {
    const {
      name,
      email,
      description = null,
      address = null,
      owner_name,
      owner_email,
      temporary_password,
    } = req.body;

    // basic validation
    if (!name || !owner_name || !owner_email || !temporary_password) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, owner_name, owner_email, temporary_password",
      });
    }

    const normalizedOwnerEmail = String(owner_email).trim().toLowerCase();

    // Check if owner email already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedOwnerEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Hash temporary password
    const hashedPassword = await bcrypt.hash(String(temporary_password), 10);

    // Run create user + create store in a single transaction (atomic)
    const result = await db.$transaction(async (prisma) => {
      const owner = await prisma.user.create({
        data: {
          name: owner_name ? String(owner_name).trim() : null,
          email: normalizedOwnerEmail,
          password: hashedPassword,
          address: "",
          role: Role.store_owner, // use Prisma enum
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      const store = await prisma.store.create({
        data: {
          name: String(name).trim(),
          email: email ? String(email).trim().toLowerCase() : null,
          description: description ? String(description).trim() : null,
          address: address ? String(address).trim() : null,
          owner_id: owner.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { owner, store };
    });

    return res.status(201).json({
      success: true,
      message: "Store and store owner account created successfully",
      store: result.store,
      owner: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        // DO NOT return password
      },
    });
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({ error: "Error creating store" });
  }
};


export const getAllRatings = async (req, res) => {
  try {
    const ratings = await db.rating.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
        store: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Error fetching all ratings:", error);
    res.status(500).json({ error: "Error fetching all ratings" });
  }
};
