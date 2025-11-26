import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../store/useThemeStore";
import {useAuthStore} from "../store/useAuthStore";
import { ArrowLeft } from "lucide-react";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    "Password must contain upper, lower, number and special character"
  );

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export default function ChangePassword() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const navigate = useNavigate();

  const changePassword = useAuthStore((s) => s.changePassword);
  const logout = useAuthStore((s) => s.logout); // optional logout action if you have it

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema), defaultValues: { currentPassword: "", password: "", confirmPassword: "" } });

  const [showPassword, setShowPassword] = useState(false);

  const bg = isDark ? "#000" : "#fff";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBorder = isDark ? "#444" : "#ccc";

  async function onSubmit(values) {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.password });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      console.error("change password error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to change password";
      toast.error(msg);
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 transition-colors duration-300"
      style={{ backgroundColor: bg, color: isDark ? "#fff" : "#000" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg p-8 border transition-all duration-300"
        style={{
          backgroundColor: cardBg,
          borderColor: border,
          color: isDark ? "#fff" : "#000",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
            onClick={() => navigate(-1)}
            className="self-start mb-4 flex items-center gap-2 px-3 py-1.5 "
            style={{
            borderColor: border,
            color: isDark ? "#fff" : "#000",
            }}
        >
            <ArrowLeft size={18} />
            Back
        </button>
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Change password</h1>
          <p className="mt-1 text-sm" style={{ color: muted }}>
            Enter your current password and choose a new secure password.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium mb-1">Current password</label>
            <input
              type="password"
              placeholder="Current password"
              autoComplete="current-password"
              {...register("currentPassword")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.currentPassword && <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                {...register("password")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-12 transition-colors"
                style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md border transition"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                  borderColor: isDark ? "#666" : "#ddd",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm new password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff" }}
            >
              {isSubmitting ? "Saving..." : "Change Password"}
            </button>
          </div>

          <div className="text-center text-sm">
            <button type="button" onClick={() => navigate(-1)} className="underline" style={{ color: isDark ? "#fff" : "#000" }}>
              Cancel
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: muted }}>
          Your password should be at least 8 characters and include upper & lower case letters, a number and a special character.
        </p>
      </div>
    </div>
  );
}
