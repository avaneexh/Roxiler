import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../store/useThemeStore";

const SignUpSchema = z
  .object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
        "Password must contain upper, lower, number and special character"
      ),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    address: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isSigningUp } = useAuthStore();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", address: "" },
  });

  const onSubmit = async (payload) => {
    try {
      // payload shape matches schema; remove confirmPassword before sending if needed
      const { confirmPassword, ...sendPayload } = payload;
      await signUp?.(sendPayload);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Sign up error:", err);
      // optionally set a visible error state here
    }
  };

  // colors by theme
  const bg = darkMode ? "#000" : "#fff";
  const cardBg = darkMode ? "rgba(255,255,255,0.03)" : "#fff";
  const border = darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const muted = darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBorder = darkMode ? "#444" : "#ccc";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 transition-colors duration-300"
      style={{ backgroundColor: bg, color: darkMode ? "#fff" : "#000" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg p-8 border transition-all duration-300"
        style={{
          backgroundColor: cardBg,
          borderColor: border,
          color: darkMode ? "#fff" : "#000",
          backdropFilter: "blur(6px)",
        }}
      >
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm" style={{ color: muted }}>
            Fill the form to get started
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              placeholder="Joey Tribbiani"
              autoComplete="name"
              {...register("name")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: darkMode ? "#fff" : "#000",
              }}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

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
                borderColor: inputBorder,
                color: darkMode ? "#fff" : "#000",
              }}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              placeholder="Shivaji Nagar, Pune"
              autoComplete="street-address"
              {...register("address")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: inputBorder,
                color: darkMode ? "#fff" : "#000",
              }}
            />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-12 transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: inputBorder,
                  color: darkMode ? "#fff" : "#000",
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md border transition"
                style={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                  borderColor: darkMode ? "#666" : "#ddd",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-12 transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: inputBorder,
                  color: darkMode ? "#fff" : "#000",
                }}
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md border transition"
                style={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                  borderColor: darkMode ? "#666" : "#ddd",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full rounded-md py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: darkMode ? "#fff" : "#000",
                color: darkMode ? "#000" : "#fff",
              }}
            >
              {isSigningUp ? "Creating..." : "Sign Up"}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "underline", color: darkMode ? "#fff" : "#000" }}>
              Login
            </Link>
          </div>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: muted }}>
          By creating an account you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
