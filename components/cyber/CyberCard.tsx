"use client";

import { ReactNode } from "react";

/* ─── Shared glassmorphism card ───────────────────────────────────────────
   Features:
     • backdrop-blur-[42px] deep frosted glass
     • 1px bright cyan border rgba(34,211,238,0.50)
     • Multi-layer box-shadow with inner light-leak
     • L-shaped corner brackets (military-tech accent)
     • Top-edge highlight + inner radial gradients
   ───────────────────────────────────────────────────────────────────────── */

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";

const BKT_SIZE = 22; // px — corner bracket arm length

function CornerBracket({
  corner,
}: {
  corner: "tl" | "tr" | "bl" | "br";
}) {
  const isTop    = corner === "tl" || corner === "tr";
  const isLeft   = corner === "tl" || corner === "bl";
  const bright   = isTop;
  const color    = bright ? CYAN : `${CYAN}80`;
  const glow     = bright
    ? `0 0 10px ${CYAN}DD`
    : `0 0 6px ${CYAN}88`;

  return (
    <div
      className="absolute"
      style={{
        width:  BKT_SIZE,
        height: BKT_SIZE,
        top:    isTop  ? 0 : "auto",
        bottom: !isTop ? 0 : "auto",
        left:   isLeft  ? 0 : "auto",
        right:  !isLeft ? 0 : "auto",
      }}
    >
      {/* Horizontal arm */}
      <div
        className="absolute"
        style={{
          height: "1.5px",
          width:  "100%",
          background: color,
          boxShadow: glow,
          top:    isTop  ? 0 : "auto",
          bottom: !isTop ? 0 : "auto",
          left:   isLeft  ? 0 : "auto",
          right:  !isLeft ? 0 : "auto",
        }}
      />
      {/* Vertical arm */}
      <div
        className="absolute"
        style={{
          width:  "1.5px",
          height: "100%",
          background: color,
          boxShadow: glow,
          top:    isTop  ? 0 : "auto",
          bottom: !isTop ? 0 : "auto",
          left:   isLeft  ? 0 : "auto",
          right:  !isLeft ? 0 : "auto",
        }}
      />
    </div>
  );
}

export function CyberCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>

      {/* ── Outer border glow (gradient overlay) ── */}
      <div
        className="absolute -inset-[1px] rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${CYAN}58 0%, transparent 42%, ${PURPLE}28 100%)`,
          filter: "blur(0.5px)",
        }}
      />

      {/* ── Card body ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(4,10,24,0.88)",
          backdropFilter: "blur(42px)",
          WebkitBackdropFilter: "blur(42px)",
          border: `1px solid rgba(34,211,238,0.50)`,
          boxShadow: [
            `0 0 60px ${CYAN}12`,
            `0 0 120px ${PURPLE}08`,
            `0 32px 80px rgba(0,0,0,0.88)`,
            /* light-leak inner shadows */
            `inset 0 1px 0 rgba(0,212,255,0.20)`,
            `inset 0 -1px 0 rgba(112,0,255,0.08)`,
            `inset 1px 0 0 rgba(0,212,255,0.07)`,
            `inset -1px 0 0 rgba(0,212,255,0.04)`,
          ].join(","),
        }}
      >
        {/* Top edge highlight */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg,transparent,${CYAN}90,${CYAN}55,transparent)`,
          }}
        />

        {/* Inner radial gradients */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              `radial-gradient(ellipse at 50% 0%,   ${PURPLE}0D 0%, transparent 52%)`,
              `radial-gradient(ellipse at 50% 100%, ${CYAN}0A 0%, transparent 48%)`,
            ].join(","),
          }}
        />

        {/* L-shaped corner brackets */}
        <CornerBracket corner="tl" />
        <CornerBracket corner="tr" />
        <CornerBracket corner="bl" />
        <CornerBracket corner="br" />

        {children}
      </div>
    </div>
  );
}
