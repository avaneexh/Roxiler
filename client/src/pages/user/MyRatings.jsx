import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useTheme } from "../../store/useThemeStore";
import {useUserStore} from "../../store/useUserStore";
import { Trash2 } from "lucide-react";


export default function MyRatings() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;

  const myRatings = useUserStore((s) => s.myRatings);
  const myRatingsLoading = useUserStore((s) => s.myRatingsLoading);
  const fetchMyRatings = useUserStore((s) => s.fetchMyRatings);
  const deleteRating = useUserStore((s) => s.deleteRating);

  useEffect(() => {
    fetchMyRatings().catch(() => {});
  }, []);

  console.log("myRatings",myRatings);
  
  const cardBg = isDark ? "bg-black" : "bg-white";
  const containerBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "text-white/70" : "text-black/60";

  const handleDelete = async (ratingId) => {
    const ok = window.confirm("Delete this rating? This action cannot be undone.");
    if (!ok) return;
    try {
      await deleteRating(ratingId);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (iso) => (iso ? dayjs(iso).format("MMM D, YYYY") : "N/A");

  return (
    <div className={`${containerBg} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/dashboard" className={isDark ? "text-white/80" : "text-black/80"}>
            ← Back
          </Link>
          <h1 className={isDark ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-black"}>
            My Ratings
          </h1>
          <div className={muted}>{(myRatings?.length ?? 0) + " rating" + ((myRatings?.length ?? 0) !== 1 ? "s" : "")}</div>
        </div>

        {myRatingsLoading && (
          <div className="p-8 rounded-md border" style={{ borderColor }}>
            Loading...
          </div>
        )}

        {!myRatingsLoading && (!myRatings || myRatings.length === 0) && (
          <div className="p-8 rounded-md border" style={{ borderColor }}>
            You haven't submitted any ratings yet.
          </div>
        )}

        <div className="space-y-4">
          {!myRatingsLoading &&
            myRatings?.map((r) => (
              <div
                key={r.id}
                className="rounded-md border"
                style={{
                  borderColor,
                  background: isDark ? "#050506" : "#fff",
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-black"}>
                        {r?.store_name ?? "—"}
                      </h3>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="text-xl font-semibold">{r.rating ?? "N/A"}</div>
                        <div aria-hidden className="text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < Math.round(r.rating ?? 0) ? "text-yellow-400" : "text-slate-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                        onClick={() => handleDelete(r.id)}
                        aria-label="Delete rating"
                        className="p-1 rounded-md transition"
                        style={{
                            background: "transparent",
                            border: "none",
                        }}
                        >
                        <Trash2
                            size={18}
                            className="text-red-600 hover:text-red-400 transition"
                        />
                    </button>

                  </div>

                  <div className="mt-3">
                    <div
                      className="rounded-md p-3 text-sm"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                        color: isDark ? "#fff" : "#000",
                        minHeight: 44, 
                      }}
                    >
                      {r.comment ? <span className="italic">"{r.comment}"</span> : <span className={muted}>No comment</span>}
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3" style={{ borderColor }}>
                    <div className={muted + " text-sm"}>{formatDate(r.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
