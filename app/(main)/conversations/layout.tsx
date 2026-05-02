"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ConversationList  from "@/components/layout/ConversationList";
import ContactPanel      from "@/components/chat/ContactPanel";
import { PresenceProvider } from "@/context/PresenceContext";

const CYAN = "#00d4ff";

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  const params         = useParams();
  const conversationId = params?.conversationId as string | undefined;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <PresenceProvider>
    <div className="flex flex-1 h-full overflow-hidden max-w-full relative">

      {/* ═══════════════════════════════════════════════════════════
          MOBILE: slide-in drawer for the user list
          ═══════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <motion.div
        className="sm:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] overflow-hidden"
        animate={{ x: drawerOpen ? 0 : -290 }}
        transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
        style={{
          boxShadow: drawerOpen ? "4px 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.08)" : "none",
        }}
      >
        <ConversationList />
        {/* Close button inside drawer */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-3 w-7 h-7 rounded-lg flex items-center justify-center z-10"
          style={{ color: "rgba(255,255,255,0.40)", background: "rgba(0,0,0,0.3)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP: static sidebar (sm+)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden sm:flex flex-shrink-0 w-[280px] xl:w-[300px] overflow-hidden">
        <ConversationList />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CENTER: chat window or empty state
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-w-0 flex-col">
        {/* Mobile menu toggle (only shown when conversation is open) */}
        {conversationId && (
          <div className="sm:hidden absolute top-3.5 left-3 z-30">
            <motion.button
              whileHover={{ color: CYAN }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                color:      "rgba(255,255,255,0.50)",
                background: "rgba(4,10,24,0.80)",
                border:     "1px solid rgba(0,212,255,0.16)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Menu className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {children}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT: contact info panel (xl+ only, when chat is open)
          ═══════════════════════════════════════════════════════════ */}
      {conversationId && (
        <div className="hidden xl:flex flex-shrink-0 w-[260px] overflow-hidden">
          <ContactPanel conversationId={conversationId} />
        </div>
      )}
    </div>
    </PresenceProvider>
  );
}
