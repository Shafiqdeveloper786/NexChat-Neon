"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Settings, Zap } from "lucide-react";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";

const NAV = [
  { href: "/conversations", icon: MessageCircle, label: "Chats" },
  { href: "/settings",      icon: Settings,      label: "Settings" },
] as const;

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col items-center w-[64px] h-screen flex-shrink-0 py-5 z-20 relative"
      style={{
        background: "rgba(4,10,24,0.92)",
        backdropFilter: "blur(42px)",
        WebkitBackdropFilter: "blur(42px)",
        borderRight: "1px solid rgba(0,212,255,0.14)",
        boxShadow: `inset -1px 0 0 rgba(0,212,255,0.06), 2px 0 20px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-8 flex-shrink-0 cursor-default select-none"
        style={{
          background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
          boxShadow: `0 0 24px ${CYAN}66, 0 0 50px ${PURPLE}33`,
        }}
      >
        <Zap className="w-5 h-5 text-[#050505]" fill="currentColor" />
      </motion.div>

      {/* Nav icons */}
      <nav className="flex flex-col gap-2 flex-1">
        {NAV.map(({ href, icon: Icon, label }, i) => {
          const active = path.startsWith(href);
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="relative"
            >
              {active && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{
                    background: `linear-gradient(180deg,${CYAN},${PURPLE})`,
                    boxShadow: `0 0 10px ${CYAN}CC`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Link
                href={href}
                title={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group"
                style={active ? {
                  background: `rgba(0,212,255,0.10)`,
                  border: `1px solid rgba(0,212,255,0.20)`,
                  boxShadow: `0 0 16px rgba(0,212,255,0.14)`,
                } : {}}
              >
                <motion.div
                  animate={{
                    color: active ? CYAN : "rgba(255,255,255,0.32)",
                    filter: active ? `drop-shadow(0 0 8px ${CYAN}CC)` : "drop-shadow(0 0 0px transparent)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 1.8} />
                </motion.div>

                {/* Tooltip */}
                <span
                  className="absolute left-[calc(100%+10px)] px-2.5 py-1.5 rounded-lg text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  style={{
                    background: "rgba(4,10,24,0.92)",
                    border: "1px solid rgba(0,212,255,0.20)",
                    backdropFilter: "blur(12px)",
                    boxShadow: `0 0 20px rgba(0,212,255,0.10)`,
                  }}
                >
                  {label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ boxShadow: `0 0 20px ${CYAN}88` }}
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-[#050505] cursor-pointer flex-shrink-0 transition-shadow duration-300"
        style={{ background: `linear-gradient(135deg,${CYAN},${PURPLE})`, boxShadow: `0 0 12px ${CYAN}44` }}
      >
        Me
      </motion.div>
    </aside>
  );
}
