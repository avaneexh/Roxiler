import {db} from "../db/db.js";


export const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find first store owned by this owner
    const store = await db.store.findFirst({
      where: { owner_id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        description: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this owner",
      });
    }

    // Aggregate ratings for this store: average and count
    const ratingAgg = await db.rating.aggregate({
      where: { store_id: store.id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const average_rating = ratingAgg._avg?.rating ?? 0;
    const total_ratings = ratingAgg._count?._all ?? 0;

    // Get ratings with user info
    const ratingUsers = await db.rating.findMany({
      where: { store_id: store.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Normalize ratingUsers to match your previous shape (user_name / user_email)
    const ratings = ratingUsers.map((r) => ({
      rating_id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_id: r.user?.id ?? null,
      user_name: r.user?.name ?? null,
      user_email: r.user?.email ?? null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        store,
        stats: {
          average_rating: Number(Number(average_rating).toFixed(2)),
          total_ratings,
        },
        ratings,
      },
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    return next(error);
  }
};

export const getStore = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // find store owned by ownerId
    const store = await db.store.findFirst({
      where: { owner_id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        description: true,
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this owner",
      });
    }

    // aggregate ratings for this store
    const ratingAgg = await db.rating.aggregate({
      where: { store_id: store.id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const average_rating = ratingAgg._avg?.rating ?? 0;
    const total_ratings = ratingAgg._count?._all ?? 0;

    return res.status(200).json({
      success: true,
      store: {
        ...store,
        stats: {
          average_rating: Number(Number(average_rating).toFixed(2)),
          total_ratings,
        },
      },
    });
  } catch (error) {
    console.error("Error in getStore:", error);
    return next(error);
  }
};

export const getRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // get first store id for owner
    const store = await db.store.findFirst({
      where: { owner_id: ownerId },
      select: { id: true },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found for this owner",
      });
    }

    const ratings = await db.rating.findMany({
      where: { store_id: store.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // map to previous shape if needed
    const formatted = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user_id: r.user?.id ?? null,
      user_name: r.user?.name ?? null,
      user_email: r.user?.email ?? null,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      ratings: formatted,
    });
  } catch (error) {
    console.error("Error in getRatings:", error);
    return next(error);
  }
};
