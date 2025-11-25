import { Role } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
import  bcrypt from "bcryptjs";
import { db } from "../db/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = (await db.user.findAll()).length;
    const totalStores = await db.store.getCount();
    const totalRatings = await db.rating.getCount();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error) {
        console.error("Error get dashboard stats:", error)
        res.status(500).json({
            error:"Error Getting stats"
        })
    }
};


export const getAllUsers = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      role: req.query.role,
      sortBy: req.query.sortBy || 'created_at', 
      sortOrder: req.query.sortOrder || 'DESC', 
    };

    const users = await db.user.findAllWithFilters(filters);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
        console.error("Error fetching all users:", error)
        res.status(500).json({
            error:"Error fetching all users"
        })
    }
};


export const getUserById = async (req, res) => {
  try {
    const user = await db.user.findByIdWithRating(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
        console.error("Error fetching user:", error)
        res.status(500).json({
            error:"Error fetching user"
        })
    }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const userExists = await db.user.exists(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const userId = await db.user.create({
      name,
      email,
      password,
      address,
      role: role || 'normal_user',
    });

    const user = await db.user.findById(userId);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error:"Error creating user"
        })
    }
};

export const getAllStores = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      sortBy: req.query.sortBy || 'created_at', 
      sortOrder: req.query.sortOrder || 'DESC', 
    };

    const stores = await db.Store.findAllWithFilters(filters);

    res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
        console.error("Error fetching all stores:", error)
        res.status(500).json({
            error:"Error fetching all stores"
        })
    }
};


export const createStore = async (req, res, next) => {
  try {
    const { name, email, description, address, owner_name, owner_email, temporary_password } = req.body;

    // Check if owner email already exists
    const existingUser = await db.user.exists(owner_email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create store owner user account with temporary password
    const ownerId = await db.user.create({
      name: owner_name,
      email: owner_email,
      password: temporary_password,
      address: '',
      role: 'store_owner'
    });

    // Create the store
    const storeId = await db.Store.create({
      name,
      email,
      description,
      address,
      owner_id: ownerId
    });

    const store = await db.Store.findById(storeId);

    res.status(201).json({
      success: true,
      message: 'Store and store owner account created successfully',
      store,
      owner: {
        id: ownerId,
        name: owner_name,
        email: owner_email,
        temporary_password: temporary_password
      }
    });
  } catch (error) {
        console.error("Error creating store:", error)
        res.status(500).json({
            error:"Error creating store"
        })
    }
};


export const getAllRatings = async (req, res) => {
  try {
    const ratings = await db.ratings.findAll();

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};
