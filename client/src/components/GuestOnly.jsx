import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function GuestOnly({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return null;
  if (authUser) {
    // send to proper dashboard
    if (authUser.role === "admin") return <Navigate to="/admin" replace />;
    if (authUser.role === "store_owner") return <Navigate to="/store" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
