import React, { useEffect } from "react";
import dayjs from "dayjs";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {useStoreOwnerStore} from "../../store/useStoreOwnerStore";
import { useTheme } from "../../store/useThemeStore";

function RatingStars({ rating }) {
  if (rating == null) return <span className="font-medium">N/A</span>;
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-semibold">{Number(rating).toFixed(2)}</span>
      <span aria-hidden className="text-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rounded ? "text-yellow-400" : "text-slate-300"}>
            ★
          </span>
        ))}
      </span>
    </span>
  );
}

export default function StoreDashboard() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;

  const {
    store,
    stats,
    ratings,
    count,
    loading,
    error,
    fetchDashboard,
    fetchRatings,
    fetchStore,
  } = useStoreOwnerStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, []); // eslint-disable-line

  const bg = isDark ? "#000" : "#fff";
  const pageText = isDark ? "#fff" : "#000";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "#fff";
  const panelBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafb";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const muted = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)";

  const formatDate = (iso) => (iso ? dayjs(iso).format("MMM D, YYYY, hh:mm A") : "—");

  return (
    <div style={{ backgroundColor: bg, color: pageText, minHeight: "100vh" }} className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold`} style={{ color: pageText }}>
              Welcome, {store?.owner?.name ?? "owner"}
            </h1>
            <div className="mt-1 text-sm" style={{ color: muted }}>
              Managing: {store?.name ?? "—"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboard({ withLoader: true }).catch(() => {})}
              className="flex items-center gap-2 px-3 py-2 rounded-md border transition"
              style={{
                borderColor,
                backgroundColor: panelBg,
                color: pageText,
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Store Info card */}
        <div
          className="rounded-md border p-6 mb-6"
          style={{ background: cardBg, borderColor }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold" style={{ color: pageText }}>
                Store Information
              </h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm" style={{ color: muted }}>
                    Store Name
                  </div>
                  <div className="font-semibold mt-1" style={{ color: pageText }}>
                    {store?.name ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-sm" style={{ color: muted }}>
                    Email
                  </div>
                  <div className="font-semibold mt-1" style={{ color: pageText }}>
                    {store?.email ?? "—"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end md:justify-end">
              {/* optional actions for owner */}
              <Link
                to="/changePassword"
                className="px-4 py-2 rounded-md border"
                style={{ borderColor, background: panelBg, color: pageText }}
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className="rounded-md border p-6"
            style={{ background: cardBg, borderColor }}
          >
            <div className="text-sm" style={{ color: muted }}>
              Average Rating
            </div>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-3xl font-semibold" style={{ color: pageText }}>
                {stats?.average_rating != null ? Number(stats.average_rating).toFixed(2) : "N/A"}
              </div>
              <div>
                <RatingStars rating={stats?.average_rating} />
              </div>
            </div>
          </div>

          <div
            className="rounded-md border p-6"
            style={{ background: cardBg, borderColor }}
          >
            <div className="text-sm" style={{ color: muted }}>
              Total Ratings
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold" style={{ color: pageText }}>
                {stats?.total_ratings ?? 0}
              </div>
              <div className="text-sm mt-1" style={{ color: muted }}>
                Reviews Received
              </div>
            </div>
          </div>
        </div>

        {/* Ratings section */}
        <div className="rounded-md border p-6" style={{ background: cardBg, borderColor }}>
          <h3 className="text-lg font-semibold" style={{ color: pageText }}>
            Customer Ratings & Reviews
          </h3>
          <p className="text-sm mt-1" style={{ color: muted }}>
            See what your customers are saying
          </p>

          <div className="mt-6 space-y-4">
            {loading && (
              <div className="p-6 text-center" style={{ color: pageText }}>
                Loading...
              </div>
            )}

            {!loading && (!ratings || ratings.length === 0) && (
              <div className="p-6 text-center" style={{ color: muted }}>
                No ratings yet.
              </div>
            )}

            {!loading &&
              (ratings || []).map((r) => (
                <div
                  key={r.rating_id ?? r.id}
                  className="rounded-md border p-4 flex items-start gap-4"
                  style={{ borderColor }}
                >
                  {/* avatar / initial */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.04)" : "#eef2f6",
                        color: pageText,
                      }}
                    >
                      {(r.user_name ?? r.user?.name ?? "U").charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold" style={{ color: pageText }}>
                          {r.user_name ?? r.user?.name ?? "—"}
                        </div>
                        <div className="text-sm" style={{ color: muted }}>
                          {r.user_email ?? r.user?.email ?? "—"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{r.rating ?? "N/A"}</div>
                          <div aria-hidden>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.round(r.rating ?? 0) ? "text-yellow-400" : "text-slate-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm mt-2" style={{ color: muted }}>
                          {r.created_at ? dayjs(r.created_at).format("MMM D, YYYY, hh:mm A") : "—"}
                        </div>
                      </div>
                    </div>

                    {/* comment */}
                    <div className="mt-3 rounded-md p-3" style={{ background: panelBg }}>
                      {r.comment ? <span className="italic">"{r.comment}"</span> : <span style={{ color: muted }}>No comment</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* optional error */}
        {error && (
          <div className="mt-6 rounded-md p-4 border" style={{ borderColor, background: panelBg, color: pageText }}>
            Error: {String(error?.message ?? error)}
          </div>
        )}
      </div>
    </div>
  );
}
