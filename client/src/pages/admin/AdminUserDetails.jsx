import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";

function RoleBadge({ role, isDark }) {
  const label = role === "store_owner" ? "store owner" : role === "normal_user" ? "normal user" : "admin";
  const cls =
    (isDark ? "bg-white text-black border-white" : "bg-black text-white border-black") +
    " px-3 py-1 rounded-full text-xs font-medium border";
  return <span className={cls}>{label}</span>;
}

function RatingStars({ rating }) {
  if (rating == null) return <div className="text-sm font-medium">N/A</div>;
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl font-semibold">{Number(rating).toFixed(2)}</div>
      <div aria-hidden className="text-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < full ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const fetchUserById = useAdminStore((s) => s.fetchUserById);
  const userDetail = useAdminStore((s) => s.userDetail);
  const loading = useAdminStore((s) => s.userDetailLoading);
  const error = useAdminStore((s) => s.userDetailError);

  const [localUser, setLocalUser] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (typeof fetchUserById === "function") {
        try {
          setLocalLoading(true);
          const result = await fetchUserById(id);
          if (mounted) {
            setLocalUser(result ?? null);
            setLocalError(null);
          }
        } catch (err) {
          if (mounted) {
            setLocalError(err?.message || "Error fetching user");
          }
        } finally {
          if (mounted) setLocalLoading(false);
        }
      } else {
        if (mounted) {
          setLocalError("fetchUserById not available on admin store");
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id, fetchUserById]);

  const effectiveUser = userDetail ?? localUser;
  const effectiveLoading = typeof loading !== "undefined" ? loading : localLoading;
  const effectiveError = typeof error !== "undefined" ? error : localError;

  const bg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const lightCardBg = isDark ? "bg-black/80 border-white/10" : "bg-white/50 border-black/5";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";

  const formatDateTime = (iso) => {
    try {
      return dayjs(iso).format("MMMM D, YYYY [at] hh:mm A");
    } catch {
      return iso ? new Date(iso).toLocaleString() : "N/A";
    }
  };

  return (
    <div className={`${bg} min-h-screen p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin/allUsers" className={isDark ? "text-white/90" : "text-black/90"}>
              ← Back
            </Link>
          </div>
          <h1 className={isDark ? "text-xl font-semibold text-white" : "text-xl font-semibold text-black"}>User Details</h1>
          <div>{/* spacer to keep header balanced */}</div>
        </div>

        {effectiveLoading && (
          <div className="p-6 rounded-md border" style={{ borderColor: border }}>
            Loading...
          </div>
        )}

        {effectiveError && (
          <div
            className="p-4 rounded-md border mb-4"
            style={{
              borderColor: border,
              background: isDark ? "#111" : "#fff",
              color: isDark ? "#fff" : "#000",
            }}
          >
            {String(effectiveError)}
          </div>
        )}

        {!effectiveLoading && effectiveUser && (
          <div className="rounded-md border p-0 overflow-hidden" style={{ borderColor: border }}>
            {/* Header row with name + email + role */}
            <div className={(isDark ? "bg-black/90" : "bg-white") + " p-6 flex items-start justify-between gap-4"}>
              <div>
                <h2 className={isDark ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-black"}>
                  {effectiveUser.name ?? "—"}
                </h2>
                <div className="mt-1" style={{ color: muted }}>
                  {effectiveUser.email ?? "—"}
                </div>
              </div>

              <div className="self-start">
                <RoleBadge role={effectiveUser.role} isDark={isDark} />
              </div>
            </div>

            {/* Basic Information */}
            <div className="p-6 border-t" style={{ borderColor: border }}>
              <h3 className={isDark ? "text-lg font-medium text-white mb-3" : "text-lg font-medium text-black mb-3"}>
                Basic Information
              </h3>

              <div className={"rounded-md border p-4"} style={{ borderColor: border }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500" style={{ color: muted }}>
                      User ID
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>#{effectiveUser.id}</div>
                  </div>

                  <div>
                    <div className="text-sm" style={{ color: muted }}>
                      Email Address
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>
                      {effectiveUser.email}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm" style={{ color: muted }}>
                      Full Name
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>
                      {effectiveUser.name}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm" style={{ color: muted }}>
                      Account Role
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>
                      {String(effectiveUser.role).replace("_", " ")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Rating */}
            <div className="p-6 border-t" style={{ borderColor: border }}>
              <h3 className={isDark ? "text-lg font-medium text-white mb-3" : "text-lg font-medium text-black mb-3"}>
                Store Rating
              </h3>

              <div className="rounded-md border p-4" style={{ borderColor: border }}>
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-24 h-16 rounded-md">
                    <div className={isDark ? "text-3xl font-semibold text-white" : "text-3xl font-semibold text-black"}>
                      {effectiveUser.stats?.averageRating != null ? Number(effectiveUser.stats.averageRating).toFixed(2) : "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className={isDark ? "text-sm text-white/80" : "text-sm text-black/70"}>Average Rating</div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <div>
                            {effectiveUser.stats?.averageRating != null ? (
                              <div className="flex items-center gap-2">
                                <div className="font-semibold">{Number(effectiveUser.stats.averageRating).toFixed(2)}</div>
                                <div aria-hidden>
                                  {Array.from({ length: 5 }).map((_, i) => {
                                    const full = Math.round(effectiveUser.stats.averageRating);
                                    return (
                                      <span key={i} className={i < full ? "text-yellow-400" : "text-gray-300"}>
                                        ★
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm italic" style={{ color: muted }}>
                                No ratings
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm" style={{ color: muted }}>
                      Total ratings: <span className="font-semibold">{effectiveUser.stats?.ratingsCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="p-6 border-t" style={{ borderColor: border }}>
              <h3 className={isDark ? "text-lg font-medium text-white mb-3" : "text-lg font-medium text-black mb-3"}>
                Account Information
              </h3>

              <div className="rounded-md border p-4" style={{ borderColor: border }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="text-sm" style={{ color: muted }}>
                      Registered On:
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>
                      {formatDateTime(effectiveUser.created_at)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm" style={{ color: muted }}>
                      Account Status:
                    </div>
                    <div className={isDark ? "font-semibold text-white mt-1" : "font-semibold text-black mt-1"}>
                      {effectiveUser.is_active || effectiveUser.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {!effectiveLoading && !effectiveUser && !effectiveError && (
          <div className="p-6 rounded-md border" style={{ borderColor: border }}>
            User not found
          </div>
        )}
      </div>
    </div>
  );
}
