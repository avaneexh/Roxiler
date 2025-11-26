import {db} from "../db/db.js";


export const getAllStores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // console.log("getallstores");
    
    // optional pagination (keep simple defaults)
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "50", 10)));
    const skip = (page - 1) * limit;

    // fetch stores with owner
    const stores = await db.store.findMany({
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        owner: { select: { id: true, name: true } },
      },
    });

    const storeIds = stores.map((s) => s.id);
    if (storeIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, stores: [] });
    }

    // aggregate ratings for all those stores in one query
    const aggs = await db.rating.groupBy({
      by: ["store_id"],
      where: { store_id: { in: storeIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });

    // map aggregates by store_id
    const aggByStore = Object.fromEntries(
      aggs.map((a) => [a.store_id, { avg: a._avg?.rating ?? 0, count: a._count?._all ?? 0 }])
    );

    // fetch user's ratings for these stores
    const userRatings = await db.rating.findMany({
      where: { user_id: userId, store_id: { in: storeIds } },
      select: { id: true, store_id: true, rating: true, comment: true },
    });
    const userRatingByStore = Object.fromEntries(userRatings.map((r) => [r.store_id, r]));

    // combine into response shape
    const result = stores.map((s) => {
      const agg = aggByStore[s.id] ?? { avg: 0, count: 0 };
      const ur = userRatingByStore[s.id] ?? null;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        description: s.description,
        owner_name: s.owner?.name ?? null,
        average_rating: Number(Number(agg.avg || 0).toFixed(2)),
        total_ratings: agg.count || 0,
        user_rating: ur ? ur.rating : null,
        user_comment: ur ? ur.comment : null,
        user_rating_id: ur ? ur.id : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      page,
      perPage: limit,
      stores: result,
    });
  } catch (error) {
    console.error("Error in getAllStores:", error);
    return next(error);
  }
};

export const rateStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // validate rating
    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5" });
    }

    // ensure store exists
    const store = await db.store.findUnique({ where: { id: storeId }, select: { id: true } });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // find existing rating
    const existing = await db.rating.findFirst({
      where: { store_id: storeId, user_id: userId },
      select: { id: true },
    });

    if (existing) {
      // update
      await db.rating.update({
        where: { id: existing.id },
        data: { rating: parsedRating, comment: comment ?? null, updated_at: new Date() },
      });
      return res.status(200).json({ success: true, message: "Rating updated successfully" });
    } else {
      // create
      await db.rating.create({
        data: {
          store_id: storeId,
          user_id: userId,
          rating: parsedRating,
          comment: comment ?? null,
        },
      });
      return res.status(201).json({ success: true, message: "Rating submitted successfully" });
    }
  } catch (error) {
    console.error("Error in rateStore:", error);
    return next(error);
  }
};

export const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const ratings = await db.rating.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
        store: {
          select: { id: true, name: true, email: true, address: true },
        },
      },
    });

    const formatted = ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      updated_at: r.updated_at,
      store_id: r.store?.id ?? null,
      store_name: r.store?.name ?? null,
      store_email: r.store?.email ?? null,
      store_address: r.store?.address ?? null,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      ratings: formatted,
    });
  } catch (error) {
    console.error("Error in getMyRatings:", error);
    return next(error);
  }
};

export const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await db.rating.findUnique({
      where: { id: ratingId },
      select: { id: true, user_id: true },
    });

    if (!rating || rating.user_id !== userId) {
      return res.status(404).json({ success: false, message: "Rating not found or unauthorized" });
    }

    await db.rating.delete({ where: { id: ratingId } });

    return res.status(200).json({ success: true, message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRating:", error);
    return next(error);
  }
};
