import React, { useEffect } from "react";
import { useTheme } from "../store/useThemeStore";

export default function Modal({ open, onClose, children, title }) {
  const { darkMode } = useTheme();
  const isDark = !!darkMode;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const overlayClass = isDark ? "bg-black/70" : "bg-black/50";
  const cardBg = isDark ? "rgba(0,0,0,0.95)" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#ffffff" : "#000000";
  const mutedColor = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
    >
      <div
        className={`absolute inset-0 ${overlayClass}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative max-w-lg w-full rounded-lg shadow-lg border p-6"
        style={{
          background: cardBg,
          borderColor,
          color: textColor,
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: textColor }}>
            {title}
          </h3>

          <button
            aria-label="Close"
            onClick={onClose}
            className="text-sm underline"
            style={{ color: mutedColor }}
          >
            Close
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
