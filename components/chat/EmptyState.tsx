"use client";

import { motion } from "framer-motion";
import { Zap, MessageCircle } from "lucide-react";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";

const DOTS = Array.from({ length: 25 }, (_, i) => ({
  color: i % 3 === 0 ? CYAN : i % 3 === 1 ? PURPLE : PINK,
  opacity: 0.15 + (i % 5) * 0.08,
}));

export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full select-none px-6">

      {/* Logo orb */}
      <div className="relative mb-8">
        {/* Outer pulsing rings */}
        {[1, 2].map(ring => (
          <motion.div
            key={ring}
            className="absolute rounded-full"
            style={{ inset: `-${ring * 14}px`, border: `1px solid ${CYAN}${ring === 1 ? "22" : "12"}` }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5 + ring, repeat: Infinity, delay: ring * 0.4 }}
          />
        ))}
        {/* Icon container */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px ${CYAN}33, 0 0 50px ${PURPLE}22`,
              `0 0 40px ${CYAN}66, 0 0 80px ${PURPLE}33`,
              `0 0 20px ${CYAN}33, 0 0 50px ${PURPLE}22`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg,rgba(0,212,255,0.12),rgba(112,0,255,0.15))`,
            border: `1px solid rgba(0,212,255,0.28)`,
          }}
        >
          <Zap
            className="w-9 h-9"
            fill={CYAN}
            style={{ color: CYAN, filter: `drop-shadow(0 0 12px ${CYAN})` }}
          />
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-black text-xl tracking-[0.22em] uppercase mb-3"
        style={{
          fontFamily: "'Orbitron', monospace",
          color: CYAN,
          textShadow: `0 0 16px ${CYAN}CC, 0 0 40px ${CYAN}55`,
        }}
      >
        NexChat
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-[11px] text-center max-w-[180px] leading-relaxed"
        style={{ color: "rgba(255,255,255,0.30)" }}
      >
        Select a conversation or start a new one in the cyberpunk grid.
      </motion.p>

      {/* Start chat button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{
          scale: 1.04,
          boxShadow: `0 0 30px ${CYAN}55, 0 0 60px ${PINK}22`,
        }}
        whileTap={{ scale: 0.97 }}
        className="mt-7 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[12px] text-white uppercase tracking-[0.14em]"
        style={{
          background: `linear-gradient(to right,${CYAN},${PINK})`,
          boxShadow: `0 0 20px ${CYAN}44`,
          fontFamily: "'Rajdhani','Orbitron',monospace",
        }}
      >
        <MessageCircle className="w-4 h-4" /> New Chat
      </motion.button>

      {/* Decorative dot grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="mt-10 grid grid-cols-5 gap-3"
      >
        {DOTS.map((dot, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ background: dot.color, opacity: dot.opacity }}
            animate={{ opacity: [dot.opacity, dot.opacity * 3, dot.opacity] }}
            transition={{ duration: 2 + (i % 4) * 0.5, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
