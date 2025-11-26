import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function StoreLayout() {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="p-6">
        <div className="max-w-9xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
