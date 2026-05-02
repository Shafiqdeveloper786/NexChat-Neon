"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FileText } from "lucide-react";
import { HexAvatar } from "@/components/ui/HexAvatar";
import type { ChatMessage } from "@/types";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  message:    ChatMessage;
  isMe:       boolean;
  index:      number;
  showAvatar: boolean;
  showName:   boolean;
  /** Optimistic status — only present on the sender's own messages */
  status?:    "sending" | "sent";
}

export default function MessageBubble({ message: msg, isMe, index, showAvatar, showName, status }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay:    Math.min(index * 0.018, 0.28),
        duration: 0.20,
        ease:     [0.22, 1, 0.36, 1],
      }}
      className={`flex items-end gap-2.5 mb-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* ── Avatar (others only) ── */}
      {!isMe && (
        showAvatar
          ? <HexAvatar user={msg.sender} size={32} showOnline={false} />
          : <div className="flex-shrink-0" style={{ width: 32 }} />
      )}

      {/* ── Bubble + meta ── */}
      <div className={`flex flex-col gap-1 max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>

        {/* Sender name */}
        {!isMe && showName && (
          <span
            className="text-[10px] font-semibold ml-1 tracking-wide"
            style={{ color: `${CYAN}CC` }}
          >
            {msg.sender.name || msg.sender.email.split("@")[0]}
          </span>
        )}

        {/* ── Bubble shell ── */}
        <div
          className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          style={isMe ? {
            /* Sender: cyan → purple gradient with neon glow */
            background:    `linear-gradient(135deg, ${CYAN}E8, ${PURPLE}CC)`,
            borderRadius:  "18px 18px 4px 18px",
            color:         "#fff",
            boxShadow:     `0 0 20px ${CYAN}30, 0 0 8px ${PURPLE}20, 0 3px 14px rgba(0,0,0,0.45)`,
          } : {
            /* Receiver: dark glass with subtle pink border */
            background:    "rgba(255,255,255,0.055)",
            backdropFilter: "blur(12px)",
            border:        "1px solid rgba(255,45,120,0.22)",
            borderRadius:  "18px 18px 18px 4px",
            color:         "rgba(255,255,255,0.90)",
            boxShadow:     "0 3px 14px rgba(0,0,0,0.35)",
          }}
        >
          {/* Text */}
          {msg.body && <p>{msg.body}</p>}

          {/* Inline image */}
          {msg.image && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ maxWidth: 220 }}>
              <Image
                src={msg.image} alt="shared"
                width={220} height={160}
                className="object-cover w-full"
              />
            </div>
          )}

          {/* File attachment */}
          {msg.fileUrl && (
            <a
              href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-75 transition-opacity"
              style={{
                background: "rgba(255,255,255,0.10)",
                color:      isMe ? "#fff" : CYAN,
              }}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {msg.fileType === "pdf" ? "PDF Document" : "Attachment"}
            </a>
          )}
        </div>

        {/* Timestamp / sending status */}
        <span className="text-[9.5px] px-1 transition-all duration-300">
          {isMe && status === "sending" ? (
            /* "sending…" in faint cyan while awaiting DB confirmation */
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ color: `${CYAN}88`, fontStyle: "italic" }}
            >
              sending…
            </motion.span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.22)" }}>
              {timeStr(msg.createdAt)}
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}
