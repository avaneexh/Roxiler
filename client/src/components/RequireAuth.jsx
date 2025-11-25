import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function RequireAuth({ allowedRoles }) {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;

  // not logged in → redirect (YOU WANT THIS)
  if (!authUser) return <Navigate to="/login" replace />;

  // wrong role → redirect to proper dashboard
  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    if (authUser.role === "admin") return <Navigate to="/admin" replace />;
    if (authUser.role === "store_owner") return <Navigate to="/store" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}