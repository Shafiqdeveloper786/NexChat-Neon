"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Search, X } from "lucide-react";
import Image from "next/image";
import { HexAvatar } from "@/components/ui/HexAvatar";
import { usePresence } from "@/context/PresenceContext";
import type { ChatConversation, ChatUser, ChatMessage } from "@/types";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";

export default function ContactPanel({ conversationId }: { conversationId: string }) {
  const { data: session }   = useSession();
  const [conv, setConv]     = useState<ChatConversation | null>(null);
  const [msgs, setMsgs]     = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const myId = session?.user?.id;
  const { isOnlineId } = usePresence();

  const load = useCallback(async () => {
    const [rC, rM] = await Promise.all([
      fetch("/api/conversations"),
      fetch(`/api/conversations/${conversationId}/messages`),
    ]);
    if (rC.ok) {
      const list: ChatConversation[] = await rC.json();
      setConv(list.find(c => c.id === conversationId) ?? null);
    }
    if (rM.ok) setMsgs(await rM.json());
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);

  const other       = conv?.users.find(u => u.id !== myId) ?? null;
  const otherOnline = other ? isOnlineId(other.id, !!other.isOnline) : false;
  const sharedImgs  = msgs.filter(m => m.image).slice(-6);
  const results    = search
    ? msgs.filter(m => m.body?.toLowerCase().includes(search.toLowerCase()))
    : [];

  if (!other) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          background:           "rgba(4,10,24,0.93)",
          backdropFilter:       "blur(42px)",
          borderLeft:           "1px solid rgba(0,212,255,0.10)",
        }}
      >
        <div className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{ borderColor: `${CYAN}44`, borderTopColor: CYAN }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full w-full overflow-y-auto"
      style={{
        background:           "rgba(4,10,24,0.93)",
        backdropFilter:       "blur(42px)",
        WebkitBackdropFilter: "blur(42px)",
        borderLeft:           "1px solid rgba(0,212,255,0.11)",
        boxShadow:            "inset 1px 0 0 rgba(0,212,255,0.05)",
      }}
    >
      <div className="px-5 py-6 flex flex-col gap-5">

        {/* ── Contact header ── */}
        <div className="flex flex-col items-center text-center">
          <HexAvatar user={{ ...other, isOnline: otherOnline }} size={72} showOnline />
          <h3 className="mt-3 font-bold text-[13px] tracking-wide" style={{ color: "rgba(255,255,255,0.92)" }}>
            {other.name || other.email.split("@")[0]}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${otherOnline ? "animate-pulse-online" : ""}`}
              style={{ background: otherOnline ? "#22d67a" : "rgba(255,255,255,0.22)" }}
            />
            <span
              className="text-[10.5px] font-semibold tracking-wide"
              style={{ color: otherOnline ? "rgba(34,214,122,0.85)" : "rgba(255,255,255,0.30)" }}
            >
              {otherOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <Divider />

        {/* ── Contact details ── */}
        <div className="space-y-2.5">
          <Detail icon={<span style={{ color: otherOnline ? "#22d67a" : "rgba(255,255,255,0.30)" }}>●</span>}
            bg="rgba(34,214,122,0.10)"
            text={otherOnline ? "Online now" : "Offline"}
            color={otherOnline ? "rgba(34,214,122,0.75)" : "rgba(255,255,255,0.35)"}
          />
          <Detail icon={<Mail className="w-3 h-3" style={{ color: CYAN }} />}
            bg={`rgba(0,212,255,0.10)`}
            text={other.email}
          />
          <Detail icon={<Phone className="w-3 h-3" style={{ color: PURPLE }} />}
            bg={`rgba(112,0,255,0.10)`}
            text="Not provided"
            muted
          />
          <Detail icon={<MessageCircle className="w-3 h-3" style={{ color: PINK }} />}
            bg={`rgba(255,45,120,0.10)`}
            text={`${msgs.length} messages`}
          />
        </div>

        <Divider />

        {/* ── Shared media gallery ── */}
        <div>
          <SectionLabel>Shared Media</SectionLabel>
          {sharedImgs.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {sharedImgs.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                  style={{ border: "1px solid rgba(0,212,255,0.14)" }}
                  whileHover={{ scale: 1.06 }}
                >
                  <Image src={m.image!} alt="media" width={80} height={80} className="object-cover w-full h-full" />
                </motion.div>
              ))}
              {Array.from({ length: Math.max(0, 3 - sharedImgs.length) }).map((_, i) => (
                <div key={`e${i}`} className="aspect-square rounded-lg"
                  style={{ background: "rgba(0,212,255,0.03)", border: "1px dashed rgba(0,212,255,0.10)" }} />
              ))}
            </div>
          ) : (
            <p className="text-[10.5px] text-center py-4" style={{ color: "rgba(255,255,255,0.18)" }}>
              No shared images yet
            </p>
          )}
        </div>

        <Divider />

        {/* ── Search within chat ── */}
        <div>
          <SectionLabel>Search in Chat</SectionLabel>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: "rgba(0,212,255,0.35)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs text-white outline-none placeholder:text-white/22 transition-all duration-200"
              style={{ background: "rgba(0,14,34,0.62)", border: "1px solid rgba(0,212,255,0.16)" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {search && (
            <div className="mt-2 space-y-1 max-h-[130px] overflow-y-auto">
              {results.length === 0
                ? <p className="text-[10px] text-center py-3" style={{ color: "rgba(255,255,255,0.20)" }}>No results</p>
                : results.slice(0, 8).map(m => (
                  <div key={m.id} className="px-2.5 py-1.5 rounded-lg text-[11px] truncate"
                    style={{ background: "rgba(0,212,255,0.05)", color: "rgba(255,255,255,0.58)", border: "1px solid rgba(0,212,255,0.09)" }}>
                    <span style={{ color: `${CYAN}99` }}>{m.sender.name ?? "You"}: </span>{m.body}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Small helpers ── */
function Divider() {
  return (
    <div className="h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,0.13),transparent)" }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const CYAN = "#00d4ff";
  return (
    <p className="text-[9.5px] font-bold tracking-[0.22em] uppercase mb-2.5" style={{ color: `${CYAN}60` }}>
      {children}
    </p>
  );
}

function Detail({
  icon, bg, text, color, muted,
}: { icon: React.ReactNode; bg: string; text: string; color?: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        {icon}
      </div>
      <span className="text-[11px] truncate" style={{ color: color ?? (muted ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.58)") }}>
        {text}
      </span>
    </div>
  );
}
