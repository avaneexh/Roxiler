import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useTheme } from "../store/useThemeStore";
import dayjs from "dayjs";

export default function AdminAllUsers() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;

  const {
    users,
    usersMeta,
    fetchUsers,
    loading,
    error,
  } = useAdminStore();

//   console.log("users", users);
  

  // local filter state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(""); 
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  const cardBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const inputBg = isDark ? "bg-black text-white border-white" : "bg-white text-black border-black";
  const btnPrimary = isDark ? "bg-white text-black border-white" : "bg-black text-white border-black";
  const btnGhost = isDark ? "text-white border-white bg-transparent" : "text-black border-black bg-transparent";

  const loadUsers = useCallback(
    async (opts = {}) => {
      const q = {
        page,
        limit,
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(address ? { address } : {}),
        ...(role ? { role } : {}),
      };
      try {
        await fetchUsers(q, { withLoader: true });
      } catch (err) {
        // handled by store
      }
    },
    [page, limit, name, email, address, role, fetchUsers]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const applyFilters = () => {
    setPage(1);
    loadUsers();
  };

  const clearFilters = () => {
    setName("");
    setEmail("");
    setAddress("");
    setRole("");
    setPage(1);
    loadUsers();
  };

  const goPrev = () => {
    if ((usersMeta.page || 1) > 1) {
      setPage((p) => Math.max(1, p - 1));
    }
  };

  const goNext = () => {
    const totalPages = Math.ceil((usersMeta.total || 0) / (usersMeta.perPage || limit || 10));
    if ((usersMeta.page || 1) < totalPages) {
      setPage((p) => p + 1);
    }
  };

  // when page changes, refetch
  useEffect(() => {
    loadUsers();
  }, [page]); // eslint-disable-line

  // helper for role badge
  const RoleBadge = ({ role }) => {
    const cls =
      (isDark ? "bg-white text-black border-white" : "bg-black text-white border-black") +
      " px-3 py-1 rounded-full text-xs font-medium border";
    return <span className={cls}>{role ?? "unknown"}</span>;
  };

  const formatDate = (iso) => {
    try {
      return dayjs(iso).format("MMM D, YYYY, hh:mm A");
    } catch {
      return iso ? new Date(iso).toLocaleString() : "N/A";
    }
  };

  return (
    <div className={`${pageBg} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className={isDark ? "text-white/90" : "text-black/90"}>← Back</Link>
            <h1 className={isDark ? "text-2xl font-semibold text-white" : "text-2xl font-semibold text-black"}>Users</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={isDark ? "text-white" : "text-black"}>Total: <span className="font-medium">{usersMeta.total ?? 0}</span></div>
            <Link to="/admin/addUser"
              className={`${btnPrimary} px-4 py-2 rounded-md border`}
            >
              Add User
            </Link>
          </div>
        </div>

        {/* Filters card */}
        <div className={`${cardBg} border rounded-md p-4 mb-6`}>
          <h3 className={isDark ? "text-white text-lg font-medium mb-3" : "text-black text-lg font-medium mb-3"}>Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Search by name"
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
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputBg} border rounded-md px-3 py-2`}
            >
              <option value="">All Roles</option>
              <option value="admin">admin</option>
              <option value="store_owner">store owner</option>
              <option value="normal_user">normal user</option>
            </select>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={applyFilters} className={`${btnPrimary} px-4 py-2 rounded-md border`}>Apply</button>
            <button onClick={clearFilters} className={`${btnGhost} px-4 py-2 rounded-md border`}>Clear</button>
          </div>
        </div>

        {/* Table */}
        <div className={`${cardBg} border rounded-md`}> 
            {/* allow horizontal scrolling when table is wider than container */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                <thead>
                    <tr>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>S.No</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>NAME</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>EMAIL</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>ROLE</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>ADDRESS</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>REGISTERED</th>
                    <th className={`px-6 py-4 text-left ${isDark ? "text-white/80" : "text-black/80"}`}>ACTIONS</th>
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                    <tr>
                        {/* updated colSpan to 8 */}
                        <td colSpan="8" className="px-6 py-10 text-center">
                        {isDark ? "Loading..." : "Loading..."}
                        </td>
                    </tr>
                    )}

                    {!loading && users?.length === 0 && (
                    <tr>
                        <td colSpan="8" className="px-6 py-10 text-center">
                        No users found
                        </td>
                    </tr>
                    )}

                    {!loading &&
                    users?.map((u, index) => (
                        <tr key={u.id} className={isDark ? "border-t border-white/10" : "border-t border-black/10"}>
                        <td className="px-6 py-4 align-top">{index + 1}</td>
                        <td className="px-6 py-4 align-top">{u.name ?? "—"}</td>
                        <td className="px-6 py-4 align-top">{u.email ?? "—"}</td>
                        <td className="px-6 py-4 align-top">
                            <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4 align-top">{u.address ?? "N/A"}</td>
                        <td className="px-6 py-4 align-top">{formatDate(u.created_at)}</td>
                        <td className="px-6 py-4 align-top whitespace-nowrap">
                            <Link
                            to={`/admin/users/${u.id}`}
                            className={isDark ? "text-white underline" : "text-black underline"}
                            >
                            View
                            </Link>
                        </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>


        <div className="mt-4 flex items-center justify-between">
          <div className={isDark ? "text-white" : "text-black"}>
            Showing {usersMeta.count ?? 0} of {usersMeta.total ?? 0}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={goPrev} className={`${btnGhost} px-3 py-1 rounded-md border`} disabled={(usersMeta.page || 1) <= 1}>
              Prev
            </button>
            <div className={isDark ? "text-white" : "text-black"}>Page {usersMeta.page ?? page}</div>
            <button
              onClick={goNext}
              className={`${btnGhost} px-3 py-1 rounded-md border`}
              disabled={Math.ceil((usersMeta.total || 0) / (usersMeta.perPage || limit || 10)) <= (usersMeta.page || page)}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={"px-3 py-1 rounded-full text-xs font-medium border " + (role ? "bg-transparent" : "")}>
      {role === "store_owner" ? "store owner" : role === "normal_user" ? "normal user" : role ?? "admin"}
    </span>
  );
}
