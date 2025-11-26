import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../store/useThemeStore";
import dayjs from "dayjs";

export default function UserDashboard() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const navigate = useNavigate();

  const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/10";
  const muted = isDark ? "text-white/70" : "text-black/60";
  const primaryBtn = isDark ? "bg-white text-black border-white" : "bg-black text-white border-black";
  const ghostBtn = isDark ? "bg-transparent text-white border-white" : "bg-transparent text-black border-black";

  const onBrowse = () => navigate("/dashboard/stores");
  const onMyRatings = () => navigate("/dashboard/my-ratings");
  const onChangePassword = () => navigate("/changePassword");

  return (
    <div className={`${pageBg} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-black"}>
            Welcome, {authUser?.name ?? "User"}
          </h1>
          <div className={muted + " mt-1"}>
            You are logged in as <span className="font-medium">{(authUser?.role ?? "").replace("_", " ") || "normal user"}</span>
          </div>
        </div>

        <div className={`rounded-md border ${isDark ? "border-white/10" : "border-black/10"} ${cardBg} p-6`}>
       
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile card */}
            <div
                className={`rounded-md p-4 ${
                isDark ? "bg-black/80 border-white/5" : "bg-white/50 border-black/5"
                } border`}
            >
                <div className="mt-4 space-y-3">
                {/* Name */}
                <div className="flex items-center justify-between">
                    <div className={muted + " text-sm"}>Name</div>
                    <div className={isDark ? "font-semibold text-white" : "font-semibold text-black"}>
                    {authUser?.name ?? "—"}
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                    <div className={muted + " text-sm"}>Email</div>
                    <div className={isDark ? "font-semibold text-white" : "font-semibold text-black"}>
                    {authUser?.email ?? "—"}
                    </div>
                </div>

                {/* Role */}
                <div className="flex items-center justify-between">
                    <div className={muted + " text-sm"}>Role</div>
                    <div className={isDark ? "font-semibold text-white" : "font-semibold text-black"}>
                    {(authUser?.role ?? "normal_user").replace("_", " ")}
                    </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between">
                    <div className={muted + " text-sm"}>Member since</div>
                    <div className={isDark ? "font-semibold text-white" : "font-semibold text-black"}>
                    {authUser?.created_at ? dayjs(authUser.created_at).format("MMM D, YYYY") : "—"}
                    </div>
                </div>
                </div>
            </div>
         </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={onBrowse}
                className={`${ghostBtn} w-full px-4 py-3 rounded-md border ${isDark ? "hover:bg-white hover:text-black hover:border-white" : "hover:bg-black hover:text-white hover:border-black"}`}>
                Browse Stores
              </button>

              <button
                onClick={onMyRatings}
                className={`${ghostBtn} w-full px-4 py-3 rounded-md border ${isDark ? "hover:bg-white hover:text-black hover:border-white" : "hover:bg-black hover:text-white hover:border-black"}`}>
                My Ratings
              </button>

              <button
                onClick={onChangePassword}
                className={`${ghostBtn} w-full px-4 py-3 rounded-md border ${isDark ? "hover:bg-white hover:text-black hover:border-white" : "hover:bg-black hover:text-white hover:border-black"}`}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
