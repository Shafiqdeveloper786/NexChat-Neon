"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/* ─── Shared neon buttons ─────────────────────────────────────────────────
   Variants:
     "primary" — cyan→pink gradient, hover:scale-[1.02] + pink glow
     "ghost"   — transparent glass with border, hover brightens
   ───────────────────────────────────────────────────────────────────────── */

const CYAN   = "#00d4ff";
const PINK   = "#ff2d78";
const PURPLE = "#7000ff";

export function CyberButton({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  variant = "primary",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost";
}) {
  if (variant === "ghost") {
    return (
      <motion.button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={{
          borderColor: `${CYAN}45`,
          background: "rgba(255,255,255,0.07)",
        }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-3 border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.65)",
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{
        scale: 1.02,
        filter: "brightness(1.13)",
        boxShadow: [
          `0 0 45px ${CYAN}55`,
          `0 0 90px ${PINK}28`,
          `0 0 30px rgba(255,45,120,0.4)`,
          `0 8px 28px rgba(0,0,0,0.55)`,
        ].join(","),
      }}
      whileTap={{ scale: 0.975 }}
      className={`w-full py-3.5 rounded-xl font-extrabold text-[15px] text-white flex items-center justify-center tracking-[0.18em] uppercase transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{
        background: `linear-gradient(to right, ${CYAN}, ${PINK})`,
        boxShadow: `0 0 24px ${CYAN}42, 0 0 50px ${PURPLE}15, 0 5px 20px rgba(0,0,0,0.48)`,
        fontFamily: "'Rajdhani','Orbitron',monospace",
      }}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </motion.button>
  );
}
