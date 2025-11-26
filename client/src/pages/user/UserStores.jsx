import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../store/useThemeStore";
import { useAuthStore } from "../../store/useAuthStore";
import {useUserStore} from "../../store/useUserStore";
import dayjs from "dayjs";
import  Modal  from "../../components/ReviewModal"
import { Link } from "react-router-dom";

function RatingStarsInline({ rating }) {
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
function StarsPicker({ value = 0, onChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(idx)}
            aria-label={`${idx} star`}
            className="text-2xl disabled:opacity-80"
            style={{ color: idx <= value ? "#f6c100" : "#d6d6d6" }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function UserStores() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const { user } = useAuthStore?.(); 

  const fetchStores = useUserStore((s) => s.fetchStores);
  const rateStore = useUserStore((s) => s.rateStore);
  const fetchMyRatings = useUserStore((s) => s.fetchMyRatings);

  const stores = useUserStore((s) => s.stores);
  const storesLoading = useUserStore((s) => s.storesLoading);
  const pageFromStore = useUserStore((s) => s.page);
  const perPage = useUserStore((s) => s.perPage);
  const totalCount = useUserStore((s) => s.totalCount);

  const [filters, setFilters] = useState({ name: "", address: "" });
  const [page, setPage] = useState(pageFromStore || 1);
  const [limit] = useState(perPage || 12);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null); 
  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const bg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black/80 border-white/10" : "bg-white border-black/10";
  const inputBorder = isDark ? "#444" : "#e6e6e6";
  const muted = isDark ? "text-white/60" : "text-black/60";
  const primaryBtn = isDark ? "bg-white text-black" : "bg-black text-white";

  const loadStores = useCallback(
    async ({ page = 1, limit = 12, q = "" } = {}) => {
      await fetchStores({ page, limit, q });
    },
    [fetchStores]
  );

  useEffect(() => {
    loadStores({ page, limit, q: filters.name || "" }).catch(() => {});
    fetchMyRatings().catch(() => {});
  }, []); 

  function applyFilters() {
    setPage(1);
    loadStores({ page: 1, limit, q: filters.name || "" }).catch(() => {});
  }

  function clearFilters() {
    setFilters({ name: "", address: "" });
    setPage(1);
    loadStores({ page: 1, limit, q: "" }).catch(() => {});
  }

  function openRatingModal(store) {
    setActiveStore(store);
    const ur = store.user_rating ?? (store.user_rating_id ? { id: store.user_rating_id, rating: store.user_rating, comment: store.user_comment } : null);

    setRatingVal(ur?.rating ?? 5);
    setComment(ur?.comment ?? "");
    setErrorMsg(null);
    setModalOpen(true);
  }

  async function submitRating() {
    if (!activeStore) return;
    setSubmitLoading(true);
    setErrorMsg(null);
    try {
      await rateStore(activeStore.id, { rating: ratingVal, comment: comment?.trim() ?? null });
      await loadStores({ page, limit, q: filters.name || "" });
      setModalOpen(false);
    } catch (err) {
      console.error("submitRating err:", err);
      setErrorMsg(err?.message || "Error submitting rating");
    } finally {
      setSubmitLoading(false);
    }
  }

  const formatDate = (iso) => (iso ? dayjs(iso).format("MMM D, YYYY") : "N/A");
//   console.log(stores);
  
  return (
    <div className={`${bg} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
            <div>
            <Link to="/dashboard" className={isDark ? "text-white/90" : "text-black/90"}>
              ← Back
            </Link>
          </div>
          <h1 className={isDark ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-black"}>Browse Stores</h1>
          <div className={muted}>{`${totalCount ?? stores.length} shown`}</div>
        </div>

        <div className={`rounded-md border p-4 mb-6 ${cardBg}`} style={{ borderColor: inputBorder }}>
          <h3 className={isDark ? "text-white font-medium" : "text-black font-medium"}>Search Stores</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Search by store name..."
              value={filters.name}
              onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
              className="rounded-md px-3 py-2 border"
              style={{ background: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            <input
              placeholder="Search by address..."
              value={filters.address}
              onChange={(e) => setFilters((p) => ({ ...p, address: e.target.value }))}
              className="rounded-md px-3 py-2 border"
              style={{ background: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => applyFilters()}
              className={`${primaryBtn} px-4 py-2 rounded-md`}
            >
              Apply
            </button>
            <button onClick={clearFilters} className="px-4 py-2 rounded-md border">
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storesLoading && (
            <div className="col-span-full p-8 text-center text-sm" style={{ color: isDark ? "#fff" : "#000" }}>
              Loading...
            </div>
          )}

          {!storesLoading &&
            (stores || []).map((s) => (
              <div key={s.id} className={`rounded-md border overflow-hidden ${cardBg}`} style={{ borderColor: inputBorder }}>
                <div className="p-5">
                  <h3 className={isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-black"}>{s.name}</h3>
                  <div className={`mt-1 ${muted}`}>Managed by {s?.owner_name}</div>
                </div>

                <div className="border-t px-5 py-4" style={{ borderColor: inputBorder }}>
                  <div className="mb-4">
                    <div className="text-sm" style={{ color: muted }}>
                      Address
                    </div>
                    <div className="mt-2 text-sm">{s.address ?? "No address provided"}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm" style={{ color: muted }}>
                      Overall Rating
                    </div>
                    <div className="mt-3 rounded-md border p-4" style={{ borderColor: inputBorder }}>
                      <div className="flex items-center gap-6">
                        <div className="text-2xl font-semibold">{s?.average_rating != null ? Number(s.average_rating).toFixed(2) : "N/A"}</div>
                        <div>
                          <div className="text-sm">
                            {s?.average_rating != null ? <RatingStarsInline rating={s.average_rating} /> : <span className="italic">N/A</span>}
                          </div>
                          <div className="text-xs mt-1" style={{ color: muted }}>
                            Based on {s?.total_ratings ?? 0} review{s?.total_ratings === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm" style={{ color: muted }}>
                      Your Rating
                    </div>

                    <div className="mt-3 rounded-md border p-4" style={{ borderColor: inputBorder }}>
                      {s.user_rating ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-xl">{s.user_rating}</div>
                            <div aria-hidden className="text-sm">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < s.user_rating ? "text-yellow-400" : "text-slate-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 text-sm italic text-slate-500">"{s?.user_comment}"</div>
                        </>
                      ) : (
                        <div className="text-sm italic" style={{ color: muted }}>
                          You haven't rated this store yet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-slate-600 mb-2">{s.email}</div>

                    <div className="flex gap-3">
                      <button
                        className={`${primaryBtn} w-full px-4 py-2 rounded-md`}
                        onClick={() => openRatingModal(s)}
                      >
                        {s.user_rating ? "Modify Rating" : "Submit Rating"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* pagination (basic) */}
        <div className="mt-6 flex items-center justify-between">
          <div className={muted}>Page {page}</div>
          <div className="flex gap-2">
            <button onClick={() => { setPage((p) => Math.max(1, p - 1)); loadStores({ page: Math.max(1, page - 1), limit, q: filters.name || "" }); }} className="px-3 py-2 rounded-md border">
              Prev
            </button>
            <button onClick={() => { setPage((p) => p + 1); loadStores({ page: page + 1, limit, q: filters.name || "" }); }} className="px-3 py-2 rounded-md border">
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={activeStore?.name ? `Rate ${activeStore.name}` : "Rate store"}>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-700">Your rating</div>
            <StarsPicker value={ratingVal} onChange={(v) => setRatingVal(v)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Comment (optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              style={{ borderColor: inputBorder, background: "transparent", color: isDark ? "#fff" : "#000" }}
            />
          </div>

          {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}

          <div className="flex items-center gap-3">
            <button onClick={submitRating} disabled={submitLoading} className={`${primaryBtn} px-4 py-2 rounded-md`}>
              {submitLoading ? "Saving..." : activeStore?.user_rating ? "Update Rating" : "Submit Rating"}
            </button>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-md border">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
