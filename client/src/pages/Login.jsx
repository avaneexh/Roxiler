import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import {  Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore";


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export default function Login() {

  const [showPassword, setShowPassword] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const { login, isLoggingIn } = useAuthStore();

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
      console.log("sign in payload", payload);
      await login(payload);
      console.log("sign in payload", payload);
      navigate("/");
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("prefers-dark", JSON.stringify(isDark));
    } catch {
      // ignore
    }  
  }, [isDark]);


  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300
        bg-white text-black
        dark:bg-black dark:text-white
      `}
      aria-live="polite"
    >
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border
          border-black/10 bg-[#f7f7f7] text-black
          dark:border-white/10 dark:bg-white/5 dark:text-white
          backdrop-blur-sm
        `}
        style={{ boxShadow: "0 10px 40px rgba(2,6,23,0.6)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
          {/* RIGHT FORM */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Create your account</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="joey@gmail.com"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full rounded-md border px-3 py-2 text-sm
                    bg-transparent
                    border-neutral-300 dark:border-neutral-700
                    focus:outline-none focus:ring-2 focus:ring-primary/40
                    ${errors.email ? "ring-1 ring-red-400" : ""}
                  `}
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
                    autoComplete="new-password"
                    {...register("password")}
                    className={`w-full rounded-md border px-3 py-2 text-sm pr-20
                      bg-transparent
                      border-neutral-300 dark:border-neutral-700
                      focus:outline-none focus:ring-2 focus:ring-primary/40
                      ${errors.password ? "ring-1 ring-red-400" : ""}
                    `}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md
                        bg-neutral-100/40 dark:bg-white/10 border border-neutral-200 dark:border-neutral-700
                        hover:bg-neutral-200/60 dark:hover:bg-white/20 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    ) : (
                        <Eye className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>


              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full rounded-md py-2 text-sm font-semibold
                    bg-black text-white hover:opacity-95
                    dark:bg-white dark:text-black
                    transition
                  "
                >
                  {isLoggingIn ? "Logingin..." : "LogIn"}
                </button> 
              </div>

              {/* footer links */}
              <div className="text-center text-sm">
                Don't have account?{" "}
                <Link to="/signup" className="text-primary underline">
                  Sign Up
                </Link>
              </div>
            </form>

            {/* small note */}
            <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
              By creating an account you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}