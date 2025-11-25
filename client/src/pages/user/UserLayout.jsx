import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function UserLayout() {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Your Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your account and activity</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Welcome, <span className="font-medium">{authUser?.name ?? authUser?.email}</span>
          </div>
        </div>
      </div>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
