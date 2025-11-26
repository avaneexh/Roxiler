import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../store/useThemeStore";

export default function UserLayout() {
   const { darkMode } = useTheme();
    const isDark = !!darkMode;
  
    const pageBg = isDark ? "bg-black text-white" : "bg-white text-black";
  
    return (
      <div className={`${pageBg} min-h-screen`}>
        <main className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    );
}
