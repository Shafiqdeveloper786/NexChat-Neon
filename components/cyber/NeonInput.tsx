"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Shared neon input field ─────────────────────────────────────────────
   Features:
     • Static label above with cyan tint
     • Icon on left — glows (drop-shadow filter) when focused
     • Transparent background → brightens subtly on focus
     • Border intensifies from rgba(0,212,255,0.20) → rgba(34,211,238,0.65)
     • Box-shadow glow on focus
   ───────────────────────────────────────────────────────────────────────── */

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";

export function NeonInput({
  label,
  icon: Icon,
  type = "text",
  name,
  placeholder,
  autoComplete,
  required,
  rightSlot,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  name: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      {/* Label — cyan-tinted, medium weight, compact */}
      <label
        className="block text-[10.5px] font-medium mb-1.5 tracking-[0.07em] transition-colors duration-200"
        style={{ color: focused ? `${CYAN}CC` : "rgba(0,212,255,0.52)" }}
      >
        {label}
      </label>

      <div className="relative">
        {/* Focus glow backdrop */}
        <AnimatePresence>
          {focused && (
            <motion.div
              key="inputGlow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute -inset-[1px] rounded-xl pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${CYAN}20, ${PURPLE}12)`,
                filter: "blur(4px)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Left icon — glows on focus */}
        <motion.div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          animate={{
            color: focused ? CYAN : "rgba(255,255,255,0.30)",
            filter: focused
              ? "drop-shadow(0 0 6px rgba(0,212,255,0.85))"
              : "drop-shadow(0 0 0px transparent)",
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>

        {/* Input */}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          className="relative z-10 w-full pl-10 py-3 rounded-xl text-[13px] text-white outline-none transition-all duration-200 placeholder:text-white/20"
          style={{
            paddingRight: rightSlot ? "2.75rem" : "1rem",
            background: focused ? "rgba(0,212,255,0.04)" : "rgba(0,14,34,0.62)",
            border: focused
              ? "1px solid rgba(34,211,238,0.65)"
              : "1px solid rgba(0,212,255,0.20)",
            boxShadow: focused
              ? `0 0 0 1px ${CYAN}18, 0 0 22px ${CYAN}12, inset 0 0 18px ${CYAN}05`
              : "none",
          }}
        />

        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}
