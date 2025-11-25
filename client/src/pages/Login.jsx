// src/pages/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../store/useThemeStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, authUser } = useAuthStore();
  const { darkMode } = useTheme(); // controlled from NavBar
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (payload) => {
    try {
      await login?.(payload);

      const role = authUser?.role;
      if (role === "admin") navigate("/admin");
      else if (role === "store_owner") navigate("/store");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? "#000" : "#fff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg p-8 border transition-all duration-300"
        style={{
          backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#fff",
          borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
          color: darkMode ? "#fff" : "#000",
          backdropFilter: "blur(6px)",
        }}
      >
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p
            className="mt-1 text-sm"
            style={{
              color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
            }}
          >
            Log in to access your account
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: darkMode ? "#444" : "#ccc",
                color: darkMode ? "#fff" : "#000",
              }}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-12 transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: darkMode ? "#444" : "#ccc",
                  color: darkMode ? "#fff" : "#000",
                }}
              />

              {/* Password toggle button */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md border transition"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                  borderColor: darkMode ? "#666" : "#ddd",
                }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-md py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: darkMode ? "#fff" : "#000",
              color: darkMode ? "#000" : "#fff",
            }}
          >
            {isLoggingIn ? "Logging in..." : "Log in"}
          </button>

          {/* Signup Link */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              style={{
                textDecoration: "underline",
                color: darkMode ? "#fff" : "#000",
              }}
            >
              Sign Up
            </Link>
          </div>
        </form>

        <p
          className="mt-6 text-xs text-center"
          style={{
            color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          }}
        >
          By logging in you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
