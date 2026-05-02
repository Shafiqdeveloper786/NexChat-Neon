"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Users, UserCircle } from "lucide-react";

const CYAN = "#00d4ff";

const TABS = [
  { href: "/conversations", icon: MessageCircle, label: "Chats"   },
  { href: "/conversations", icon: Users,         label: "People"  },
  { href: "/profile",       icon: UserCircle,    label: "Profile" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30">
      <div
        className="flex items-center justify-around py-2 px-4"
        style={{
          background:           "rgba(4,10,24,0.95)",
          backdropFilter:       "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop:            "1px solid rgba(0,212,255,0.12)",
          boxShadow:            "0 -4px 24px rgba(0,0,0,0.5)",
          paddingBottom:        "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = label === "Chats" ? pathname.startsWith("/conversations") : pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[60px] py-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg,${CYAN},#7000ff)`,
                    boxShadow:  `0 0 8px ${CYAN}CC`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={{
                  color:  active ? CYAN : "rgba(255,255,255,0.32)",
                  filter: active ? `drop-shadow(0 0 6px ${CYAN}AA)` : "drop-shadow(0 0 0px transparent)",
                }}
                transition={{ duration: 0.18 }}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.8} />
              </motion.div>
              <span
                className="text-[10px] font-medium tracking-wide transition-colors"
                style={{ color: active ? CYAN : "rgba(255,255,255,0.30)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
