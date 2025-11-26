import React, { useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";
import { useNavigate, Outlet } from "react-router-dom";

function StatCard({ title, value, theme }) {
  const isDark = theme;
  return (
    <div
      className={
        (isDark ? "bg-black text-white border-white" : "bg-white text-black border-black") +
        " border rounded-md p-6 shadow-sm"
      }
    >
      <div className={isDark ? "text-white/80" : "text-black/80"}>{title}</div>
      <div className={"mt-3 text-3xl font-semibold " + (isDark ? "text-white" : "text-black")}>
        {value}
      </div>
    </div>
  );
}

function ManagementCard({ title, description, primaryLabel, secondaryLabel, onPrimary, onSecondary, theme }) {
  const isDark = theme;

  const cardClasses =
    (isDark ? "bg-black text-white border-white" : "bg-white text-black border-black") +
    " border rounded-md p-6 shadow-sm flex flex-col justify-between";

  const primaryBtnClasses = (isDark
    ? "bg-white text-black border-white"
    : "bg-black text-white border-black") + " w-full px-4 py-2 rounded-md hover:opacity-95 transition";

  const secondaryBtnClasses = (isDark
    ? "border-white text-white"
    : "border-black text-black") + " w-full px-4 py-2 rounded-md bg-transparent";

  return (
    <div className={cardClasses}>
      <div>
        <h3 className={"text-lg font-medium " + (isDark ? "text-white" : "text-black")}>{title}</h3>
        <p className={(isDark ? "text-white/80" : "text-black/80") + " mt-2 text-sm"}>{description}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {primaryLabel && (
          <button onClick={onPrimary} className={primaryBtnClasses}>
            {primaryLabel}
          </button>
        )}
        {secondaryLabel && (
          <button onClick={onSecondary} className={secondaryBtnClasses + " border"}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { dashboardStats, fetchDashboardStats, loading, error, fetchUsers, fetchStores, fetchRatings } =
    useAdminStore();
  const { darkMode, toggleTheme } = useTheme(); 
  const isDark = darkMode;
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardStats().catch(() => {});
  }, []);

  // top-level container classes toggled with ternary
  const pageClasses = (isDark ? "bg-black text-white" : "bg-white text-black") + " min-h-screen p-8";

  const headerTitleClass = isDark ? "text-3xl font-bold text-white" : "text-3xl font-bold text-black";
  const subtitleClass = isDark ? "mt-2 text-sm text-white/80" : "mt-2 text-sm text-black/80";

  const toggleBtnClass =
    (isDark ? "bg-white text-black border-white" : "bg-black text-white border-black") +
    " px-3 py-2 rounded-md border";

  return (
    <div className={pageClasses}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={headerTitleClass}>Welcome back, Administrator</h1>
            <div className={subtitleClass}>Administrator</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard theme={isDark} title="Total Users" value={loading ? "..." : dashboardStats?.totalUsers ?? 0} />
          <StatCard theme={isDark} title="Total Stores" value={loading ? "..." : dashboardStats?.totalStores ?? 0} />
          <StatCard theme={isDark} title="Total Ratings" value={loading ? "..." : dashboardStats?.totalRatings ?? 0} />
        </div>

        {/* Management heading */}
        <h2 className={(isDark ? "mt-12 text-xl font-semibold text-white" : "mt-12 text-xl font-semibold text-black")}>
          Management
        </h2>

        {/* Management cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ManagementCard
            theme={isDark}
            title="Users"
            description="View and manage all users"
            primaryLabel="View All Users"
            secondaryLabel="Add New User"
            onPrimary={() => navigate("/admin/allUsers")}
            onSecondary={() => navigate("/admin/addUser")}
          />

          <ManagementCard
            theme={isDark}
            title="Stores"
            description="View and manage stores"
            primaryLabel="View All Stores"
            secondaryLabel="Add New Store"
            onPrimary={() => navigate("/admin/allStores")}
            onSecondary={() => navigate("/admin/createStore")}
          />

          <ManagementCard
            theme={isDark}
            title="Ratings"
            description="View all submitted ratings"
            primaryLabel="View All Ratings"
            onPrimary={() => navigate("/admin/allRatings")}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
