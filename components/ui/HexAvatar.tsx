"use client";

import { useId } from "react";
import Image from "next/image";
import type { ChatUser } from "@/types";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";
const GREEN  = "#22d67a";

const PALETTE: [string, string][] = [
  [CYAN, PURPLE],
  [PINK, PURPLE],
  [PURPLE, CYAN],
  [CYAN, PINK],
];

/* ─────────────────────────────────────────────────────────────────────────
   Shared hexagonal avatar used across ConversationList, ChatWindow,
   MessageBubble and ContactPanel.

   Props:
     user        – ChatUser (needs id, name, email, image, isOnline?)
     size        – pixel size (default 44)
     showOnline  – whether to render the status dot + border colour change
   ───────────────────────────────────────────────────────────────────────── */
export function HexAvatar({
  user,
  size = 44,
  showOnline = false,
}: {
  user: ChatUser;
  size?: number;
  showOnline?: boolean;
}) {
  const uid = useId().replace(/:/g, "h");

  const initials = (user.name || user.email || "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [c1, c2] = PALETTE[(initials.charCodeAt(0) || 0) % PALETTE.length];
  const isOnline   = showOnline && !!user.isOnline;
  const borderCol  = isOnline ? GREEN : `${CYAN}70`;
  const strokeW    = isOnline ? 4 : 2.5;
  const filterId   = `hf_${uid}`;
  const gradId     = `hg_${uid}`;
  const inset      = Math.round(size * 0.11);
  const dotSize    = Math.round(size * 0.24);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>

      {/* ── SVG hexagon border with glow ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        style={{ zIndex: 2 }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points="50,2 95,26 95,74 50,98 5,74 5,26"
          fill="none"
          stroke={borderCol}
          strokeWidth={strokeW}
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* ── Hex-clipped content ── */}
      <div
        className="absolute overflow-hidden flex items-center justify-center hex-clip text-white font-bold select-none"
        style={{
          inset,
          fontSize: Math.round(size * 0.32),
          background: user.image ? undefined : `linear-gradient(135deg,${c1},${c2})`,
        }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "avatar"}
            fill
            sizes={`${size}px`}
            className="object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* ── Status dot ── */}
      {showOnline && (
        <div
          className={isOnline ? "animate-pulse-online" : ""}
          style={{
            position:    "absolute",
            width:       dotSize,
            height:      dotSize,
            borderRadius: "50%",
            bottom:      0,
            right:       0,
            zIndex:      3,
            background:  isOnline ? GREEN : "rgba(255,255,255,0.22)",
            border:      `${Math.max(1, Math.round(size * 0.04))}px solid rgba(4,10,24,0.95)`,
            boxShadow:   isOnline ? `0 0 6px ${GREEN}` : "none",
          }}
        />
      )}
    </div>
  );
}
