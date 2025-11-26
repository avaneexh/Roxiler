// src/pages/admin/AdminCreateStore.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "../../store/useAdminStore";
import { useTheme } from "../../store/useThemeStore";

/**
 * Schema:
 * - store name: required
 * - owner name: required
 * - owner email: valid
 * - store email: optional but validate if provided
 * - temporary_password: min 8
 */
const CreateStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  email: z.string().email("Invalid store email").optional().or(z.literal("")),
  description: z.string().optional(),
  address: z.string().optional(),
  owner_name: z.string().min(1, "Owner name is required"),
  owner_email: z.string().email("Invalid owner email"),
  temporary_password: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export default function AdminCreateStore() {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;
  const navigate = useNavigate();

  const createStore = useAdminStore((s) => s.createStore);

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(CreateStoreSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      address: "",
      owner_name: "",
      owner_email: "",
      temporary_password: "",
    },
  });

  const tempPassword = watch("temporary_password");

  // UI color variables to match your SignUp styling
  const bg = isDark ? "#000" : "#fff";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const inputBorder = isDark ? "#444" : "#ccc";

  const onSubmit = async (payload) => {
    setSubmitError(null);
    try {
      // map to backend fields — your createStore expects owner_name, owner_email, temporary_password
      const data = {
        name: payload.name,
        email: payload.email || null,
        description: payload.description || null,
        address: payload.address || null,
        owner_name: payload.owner_name,
        owner_email: payload.owner_email,
        temporary_password: payload.temporary_password,
      };

      await createStore(data);
      // navigate to stores list after creation
      navigate("/admin/stores", { replace: true });
    } catch (err) {
      console.error("Create store error:", err);
      const message = err?.message || (err?.response?.data?.message ?? "Error creating store");
      setSubmitError(message);
    }
  };

  // generate a random temporary password (8-12 chars)
  const generatePassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pw = "";
    for (let i = 0; i < length; i++) pw += charset[Math.floor(Math.random() * charset.length)];
    return pw;
  };

  const handleGenerate = () => {
    const g = generatePassword(10);
    setValue("temporary_password", g, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-start justify-center p-6 transition-colors duration-300"
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
          <h1 className="text-2xl font-bold">Create Store</h1>
          <p className="mt-1 text-sm" style={{ color: muted }}>
            Creating a store will automatically create a store owner account. The store owner will need to change their password on first login.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Store Info */}
          <div>
            <h3 className="text-sm font-medium mb-2">Store Information</h3>

            <label className="block text-sm font-medium mb-1">Store Name</label>
            <input
              type="text"
              placeholder="Enter store name"
              {...register("name")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}

            <label className="block text-sm font-medium mb-1 mt-4">Store Email</label>
            <input
              type="email"
              placeholder="Enter store email address"
              {...register("email")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}

            <label className="block text-sm font-medium mb-1 mt-4">Description (optional)</label>
            <textarea
              placeholder="Enter store description"
              {...register("description")}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}

            <label className="block text-sm font-medium mb-1 mt-4">Store Address (optional)</label>
            <input
              type="text"
              placeholder="Enter store address"
              {...register("address")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
          </div>

          <hr className="my-3" style={{ borderColor: border }} />

          {/* Owner Info */}
          <div>
            <h3 className="text-sm font-medium mb-2">Store Owner Information</h3>

            <label className="block text-sm font-medium mb-1">Store Owner Name</label>
            <input
              type="text"
              placeholder="Enter store owner name"
              {...register("owner_name")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.owner_name && <p className="mt-1 text-xs text-red-400">{errors.owner_name.message}</p>}

            <label className="block text-sm font-medium mb-1 mt-4">Store Owner Email</label>
            <input
              type="email"
              placeholder="Enter store owner email"
              {...register("owner_email")}
              className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
              style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
            />
            {errors.owner_email && <p className="mt-1 text-xs text-red-400">{errors.owner_email.message}</p>}
          </div>

          {/* Temporary password */}
          <div>
            <h3 className="text-sm font-medium mb-2">Temporary Password</h3>

            <div className="relative flex items-center gap-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter or generate password"
                {...register("temporary_password")}
                className="w-full rounded-md border px-3 py-2 text-sm pr-28 transition-colors"
                style={{ backgroundColor: "transparent", borderColor: inputBorder, color: isDark ? "#fff" : "#000" }}
              />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-24 top-1/2 -translate-y-1/2 p-1.5 rounded-md border transition ml-0.5"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                  borderColor: isDark ? "#666" : "#ddd",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                className="ml-2 px-3 py-1 rounded-md border"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)", borderColor: border }}
              >
                Generate
              </button>
            </div>

            <p className="mt-1 text-xs" style={{ color: muted }}>
              The store owner will be required to change this password on first login.
            </p>
            {errors.temporary_password && <p className="mt-1 text-xs text-red-400">{errors.temporary_password.message}</p>}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: isDark ? "#fff" : "#000", color: isDark ? "#000" : "#fff" }}
            >
              {isSubmitting ? "Creating..." : "Create Store & Owner Account"}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            <Link to="/admin/allStores" style={{ textDecoration: "underline", color: isDark ? "#fff" : "#000" }}>
              Back to stores
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
      </div>
    </div>
  );
}
