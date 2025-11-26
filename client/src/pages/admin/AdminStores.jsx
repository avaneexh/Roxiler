import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";

function RatingStars({ rating }) {
  if (rating == null) return <span className="font-medium">N/A</span>;
  const r = Math.round(rating); // round to nearest whole for stars
  const stars = Array.from({ length: 5 }).map((_, i) => (i < r ? "★" : "☆"));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-semibold">{Number(rating).toFixed(2)}</span>
      <span className="text-sm tracking-wide" aria-hidden>
        {stars.join(" ")}
      </span>
    </span>
  );
}

export default function AdminStores() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const navigate = useNavigate();

  const { stores, storesMeta, fetchStores, loading, error } = useAdminStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const inputBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const btnPrimary = isDark ? "bg-white text-black border-white" : "bg-black text-white border-black";
  const btnGhost = isDark ? "text-white border-white bg-transparent" : "text-black border-black bg-transparent";

  const loadStores = useCallback(
    async (opts = {}) => {
      const q = {
        page,
        limit,
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(address ? { address } : {}),
      };
      try {
        await fetchStores(q, { withLoader: true });
      } catch (err) {
        // store handles errors
      }
    },
    [page, limit, name, email, address, fetchStores]
  );

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    loadStores();
  }, [page]); 

  const applyFilters = () => {
    setPage(1);
    loadStores();
  };

  const clearFilters = () => {
    setName("");
    setEmail("");
    setAddress("");
    setPage(1);
    loadStores();
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => {
    const totalPages = Math.ceil((storesMeta.total || 0) / (storesMeta.perPage || limit));
    setPage((p) => (p < totalPages ? p + 1 : p));
  };

  const formatDate = (iso) => {
    try {
      return dayjs(iso).format("MM/DD/YYYY");
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
              Stores
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={isDark ? "text-white" : "text-black"}>
              Total: <span className="font-medium">{storesMeta.total ?? 0}</span>
            </div>
            <button
              onClick={() => navigate("/admin/createStore")}
              className={`${btnPrimary} px-4 py-2 rounded-md border`}
            >
              Add Store
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${cardBg} border rounded-md p-4 mb-6`}>
          <h3 className={isDark ? "text-white text-lg font-medium mb-3" : "text-black text-lg font-medium mb-3"}>
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Search by store name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            />
            <input
              placeholder="Search by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            />
            <input
              placeholder="Search by address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

        {/* Table card */}
        <div className={`${cardBg} border rounded-md`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>S.no</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>STORE NAME</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>EMAIL</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>ADDRESS</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>OWNER</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>RATING</th>
                  <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>CREATED</th>
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

                {!loading && (!stores || stores.length === 0) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      No stores found
                    </td>
                  </tr>
                )}

                {!loading &&
                  stores?.map((s, idx) => (
                    <tr key={s.id} className={isDark ? "border-t border-white/10" : "border-t border-black/10"}>
                      <td className="px-6 py-4 align-top">{idx+1}</td>
                      <td className="px-6 py-4 align-top">{s.name ?? "—"}</td>
                      <td className="px-6 py-4 align-top">{s.email ?? "—"}</td>
                      <td className="px-6 py-4 align-top">{s.address ?? "N/A"}</td>
                      <td className="px-6 py-4 align-top">{s.owner?.name ?? "—"}</td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <RatingStars rating={s.rating ?? null} />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className={isDark ? "text-white" : "text-black"}>
            Showing {storesMeta.count ?? 0} of {storesMeta.total ?? 0}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={goPrev} className={`${btnGhost} px-3 py-1 rounded-md border`} disabled={(storesMeta.page || 1) <= 1}>
              Prev
            </button>
            <div className={isDark ? "text-white" : "text-black"}>Page {storesMeta.page ?? page}</div>
            <button
              onClick={goNext}
              className={`${btnGhost} px-3 py-1 rounded-md border`}
              disabled={Math.ceil((storesMeta.total || 0) / (storesMeta.perPage || limit || 10)) <= (storesMeta.page || page)}
            >
              Next
            </button>
          </div>
        </div>

        {error && (
          <div className={`${isDark ? "bg-white text-black border-black" : "bg-black text-white border-white"} mt-4 p-3 rounded-md border`}>
            {String(error)}
          </div>
        )}
      </div>
    </div>
  );
}
