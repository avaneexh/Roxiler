import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";


const CreateUserSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().optional(),
  role: z.enum(["admin", "store_owner", "normal_user"]).optional(),
});

export default function AdminCreateUser() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const navigate = useNavigate();

  const createUser = useAdminStore((s) => s.createUser);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: { name: "", email: "", password: "", address: "", role: "normal_user" },
  });

  // UI colors (match your signup page)
  const bg = isDark ? "#000" : "#fff";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBorder = isDark ? "#444" : "#ccc";

  const onSubmit = async (payload) => {
    setSubmitError(null);
    try {
      const user = await createUser(payload);
      navigate("/admin/allUsers", { replace: true });
    } catch (err) {
      console.error("Create user error:", err);
      const message = err?.message || (err?.response?.data?.message ?? "Error creating user");
      setSubmitError(message);
    }
  };

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
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create user</h1>
          <p className="mt-1 text-sm" style={{ color: muted }}>
            As an admin, you can create users with simplified requirements.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              {...register("name")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: isDark ? "#fff" : "#000",
              }}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: isDark ? "#fff" : "#000",
              }}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                {...register("password")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-12 transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: inputBorder,
                  color: isDark ? "#fff" : "#000",
                }}
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
            <p className="mt-1 text-xs" style={{ color: muted }}>
              Minimum 8 characters
            </p>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address (optional)</label>
            <textarea
              placeholder="Enter address"
              {...register("address")}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: isDark ? "#fff" : "#000",
              }}
            />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              {...register("role")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: isDark ? "#fff" : "#000",
              }}
            >
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isDark ? "#fff" : "#000",
                color: isDark ? "#000" : "#fff",
              }}
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            <Link to="/admin/allUsers" style={{ textDecoration: "underline", color: isDark ? "#fff" : "#000" }}>
              Back to users
            </Link>
          </div>
        </form>

        {submitError && (
          <div
            className="mt-6 p-3 rounded-md border"
            style={{
              backgroundColor: isDark ? "#fff" : "#000",
              color: isDark ? "#000" : "#fff",
              borderColor: border,
            }}
          >
            {String(submitError)}
          </div>
        )}

        <p className="mt-6 text-xs text-center" style={{ color: muted }}>
          Created user will receive a temporary password (the one you enter) — they should change it on first login.
        </p>
      </div>
    </div>
  );
}
