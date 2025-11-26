// src/pages/admin/AdminRatings.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";

/** Small star renderer (shows filled/unfilled stars and numeric rating) */
function RatingStars({ rating }) {
  if (rating == null) return <span className="font-medium">N/A</span>;
  const rounded = Math.round(rating); // 1-5
  const stars = Array.from({ length: 5 }).map((_, i) => (i < rounded ? "★" : "☆"));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-semibold">{Number(rating).toFixed(0)}</span>
      <span className="text-sm" aria-hidden>
        {stars.join(" ")}
      </span>
    </span>
  );
}

export default function AdminRatings() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;

  const { ratings, ratingsCount, fetchRatings, loading, error } = useAdminStore();

  // filters & pagination
  const [storeFilter, setStoreFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // "", "1","2","3","4","5"
  const [q, setQ] = useState(""); // comment search
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // stats derived from fetched ratings (fallback if store returns stats separately)
  const stats = useMemo(() => {
    const total = ratings?.length ?? 0;
    const withComments = (ratings ?? []).filter((r) => Boolean(r.comment && r.comment.trim())).length;
    const avg =
      (ratings ?? []).reduce((s, r) => s + (typeof r.rating === "number" ? r.rating : 0), 0) /
      (ratings?.length || 1);
    return { total: ratingsCount ?? total, withComments, average: ratings && ratings.length ? avg : 0 };
  }, [ratings, ratingsCount]);

  const loadRatings = useCallback(
    async (opts = {}) => {
      const params = {
        page,
        limit,
        ...(storeFilter ? { store: storeFilter } : {}),
        ...(userFilter ? { user: userFilter } : {}),
        ...(ratingFilter ? { rating: ratingFilter } : {}),
        ...(q ? { q } : {}),
      };
      try {
        await fetchRatings(params, { withLoader: true });
      } catch (err) {
        // store sets error
      }
    },
    [page, limit, storeFilter, userFilter, ratingFilter, q, fetchRatings]
  );

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  // small helpers
  const applyFilters = () => {
    setPage(1);
    loadRatings();
  };
  const clearFilters = () => {
    setStoreFilter("");
    setUserFilter("");
    setRatingFilter("");
    setQ("");
    setPage(1);
    loadRatings();
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => {
    // if backend had total pages, use that. Here we guess based on ratingsCount
    const totalPages = Math.ceil((ratingsCount || 0) / limit) || 1;
    setPage((p) => (p < totalPages ? p + 1 : p));
  };

  const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const inputBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const btnPrimary = isDark ? "bg-white text-black border-white" : "bg-black text-white border-black";
  const btnGhost = isDark ? "text-white border-white bg-transparent" : "text-black border-black bg-transparent";

  const formatDate = (iso) => {
    try {
      return dayjs(iso).format("MMM D, YYYY");
    } catch {
      return iso ? new Date(iso).toLocaleDateString() : "N/A";
    }
  };

  return (
    <div className={`${pageBg} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className={isDark ? "text-white/90" : "text-black/90"}>
              ← Back
            </Link>
            <h1 className={isDark ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-black"}>
              All Ratings
            </h1>
          </div>

          <div className={isDark ? "text-white" : "text-black"}>{`${stats.total ?? 0} of ${stats.total ?? 0} ratings`}</div>
        </div>

        {/* Filters */}
        <div className={`${cardBg} border rounded-md p-4 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Filter by store..."
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            />
            <input
              placeholder="Filter by user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            >
              <option value="">All ratings</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★ & above</option>
              <option value="3">3 ★ & above</option>
              <option value="2">2 ★ & above</option>
              <option value="1">1 ★ & above</option>
            </select>
            <input
              placeholder="Search comments..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={applyFilters} className={`${btnPrimary} px-4 py-2 rounded-md border`}>
              Apply
            </button>
            <button onClick={clearFilters} className={`${btnGhost} px-4 py-2 rounded-md border`}>
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBg} border rounded-md mb-6`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>S.No</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>STORE</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>USER</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>RATING</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>COMMENT</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>DATE</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && (!ratings || ratings.length === 0) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      No ratings found
                    </td>
                  </tr>
                )}

                {!loading &&
                  ratings?.map((r, idx) => (
                    <tr key={r.id} className={isDark ? "border-t border-white/10" : "border-t border-black/10"}>
                      <td className="px-6 py-4 align-top">{idx+1}</td>
                      <td className="px-6 py-4 align-top">{r.store?.name ?? "—"}</td>
                      <td className="px-6 py-4 align-top">{r.user?.name ?? "Anonymous"}</td>
                      <td className="px-6 py-4 align-top">
                        <RatingStars rating={r.rating} />
                      </td>
                      <td className="px-6 py-4 align-top">{r.comment ? r.comment : <span className="text-sm italic">No comment</span>}</td>
                      <td className="px-6 py-4 align-top">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats */}
        <div className={`${cardBg} border rounded-md p-6 grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <div>
            <div className={isDark ? "text-white/80" : "text-black/70"}>Average Rating</div>
            <div className="mt-2 text-2xl font-semibold">{stats.average ? Number(stats.average).toFixed(1) : "0.0"} / 5</div>
          </div>

          <div>
            <div className={isDark ? "text-white/80" : "text-black/70"}>Total Ratings</div>
            <div className="mt-2 text-2xl font-semibold">{stats.total ?? 0}</div>
          </div>

          <div>
            <div className={isDark ? "text-white/80" : "text-black/70"}>With Comments</div>
            <div className="mt-2 text-2xl font-semibold">{stats.withComments ?? 0}</div>
          </div>
        </div>

        {error && (
          <div className={`${isDark ? "bg-white text-black border-black" : "bg-black text-white border-white"} mt-4 p-3 rounded-md border`}>
            {String(error)}
          </div>
        )}

        {/* pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className={isDark ? "text-white" : "text-black"}>Showing {ratings?.length ?? 0} of {ratingsCount ?? 0}</div>
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className={`${btnGhost} px-3 py-1 rounded-md border`} disabled={page <= 1}>
              Prev
            </button>
            <div className={isDark ? "text-white" : "text-black"}>Page {page}</div>
            <button onClick={goNext} className={`${btnGhost} px-3 py-1 rounded-md border`} disabled={(ratingsCount || 0) <= page * limit}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
