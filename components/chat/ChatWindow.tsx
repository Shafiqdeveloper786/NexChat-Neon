"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, MoreHorizontal } from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import { HexAvatar }    from "@/components/ui/HexAvatar";
import MessageBubble    from "@/components/chat/MessageBubble";
import ChatInput        from "@/components/chat/ChatInput";
import { usePresence }  from "@/context/PresenceContext";
import type { ChatMessage, ChatConversation } from "@/types";

type MsgWithStatus = ChatMessage & { _status?: "sending" | "sent" };

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";

export default function ChatWindow({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const bottomRef          = useRef<HTMLDivElement>(null);
  const myId               = session?.user?.id;
  const { isOnlineId }     = usePresence();

  const [conv, setConv]             = useState<ChatConversation | null>(null);
  const [messages, setMessages]     = useState<MsgWithStatus[]>([]);
  const [loading, setLoading]       = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const other = conv?.users.find(u => u.id !== myId) ?? null;
  // Derive live online status from shared presence context (same source as sidebar)
  const otherOnline = other ? isOnlineId(other.id, !!other.isOnline) : false;

  /* ── Fetch conversation details ── */
  const fetchConv = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const list: ChatConversation[] = await res.json();
      setConv(list.find(c => c.id === conversationId) ?? null);
    }
  }, [conversationId]);

  /* ── Fetch messages ── */
  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) setMessages(await res.json());
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    Promise.all([fetchConv(), fetchMessages()]).finally(() => setLoading(false));
  }, [fetchConv, fetchMessages]);

  /* ── Auto-scroll to newest message ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Pusher: real-time messages + typing ── */
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ch: any = client.subscribe(`conversation-${conversationId}`);

    ch.bind("new-message", (msg: ChatMessage) => {
      if (msg.sender.id === myId) return; // already added optimistically
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTypingUser(null);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
    });

    ch.bind("typing", (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === myId) return;
      if (data.isTyping) {
        setTypingUser(data.userName);
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => setTypingUser(null), 4000);
      } else {
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        setTypingUser(null);
      }
    });

    return () => {
      client.unsubscribe(`conversation-${conversationId}`);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
    };
  }, [conversationId, myId]);

  /* ── Send message (optimistic) ── */
  const handleSend = useCallback(async (payload: {
    body?: string; image?: string; fileUrl?: string; fileType?: string;
  }) => {
    if (!myId) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: MsgWithStatus = {
      id:        tempId,
      body:      payload.body || null,
      image:     payload.image || null,
      fileUrl:   payload.fileUrl || null,
      fileType:  payload.fileType || null,
      createdAt: new Date().toISOString(),
      _status:   "sending",
      sender: {
        id:    myId,
        name:  session?.user?.name  ?? null,
        email: session?.user?.email ?? "",
        image: session?.user?.image ?? null,
      },
    };
    setMessages(prev => [...prev, optimistic]);

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (res.ok) {
      const saved: ChatMessage = await res.json();
      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...saved, _status: "sent" } : m
      ));
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  }, [conversationId, myId, session]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "rgba(3,8,20,0.60)" }}
      >
        <div
          className="w-9 h-9 rounded-full border-2 animate-spin"
          style={{ borderColor: `${CYAN}44`, borderTopColor: CYAN }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full min-w-0"
      style={{ background: "rgba(3,8,20,0.60)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{
          background:           "rgba(4,10,24,0.95)",
          backdropFilter:       "blur(42px)",
          WebkitBackdropFilter: "blur(42px)",
          borderBottom:         "1px solid rgba(0,212,255,0.14)",
          boxShadow:            "0 1px 0 rgba(0,212,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile: left-side space so avatar isn't hidden under the hamburger */}
          <div className="sm:hidden w-9 flex-shrink-0" />

          {other ? (
            <HexAvatar user={{ ...other, isOnline: otherOnline }} size={38} showOnline />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${CYAN},${PURPLE})`, color: "#050505" }}
            >
              NN
            </div>
          )}

          <div className="min-w-0">
            <h3
              className="font-bold text-sm tracking-wide truncate"
              style={{ fontFamily: "'Orbitron',monospace", color: "rgba(255,255,255,0.92)" }}
            >
              {other?.name || "NexChat Neon"}
            </h3>

            {/* Status line: typing takes priority over online/offline */}
            <AnimatePresence mode="wait">
              {typingUser ? (
                <motion.p
                  key="typing-header"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[10.5px] font-semibold flex items-center gap-1.5"
                  style={{ color: CYAN }}
                >
                  {/* Three micro dots inline */}
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="inline-block w-1 h-1 rounded-full"
                      style={{ background: CYAN }}
                      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
                    />
                  ))}
                  <span>typing…</span>
                </motion.p>
              ) : (
                <motion.p
                  key="status-header"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[10.5px] font-semibold flex items-center gap-1.5"
                  style={{ color: otherOnline ? "rgba(34,214,122,0.90)" : "rgba(255,255,255,0.32)" }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${otherOnline ? "animate-pulse-online" : ""}`}
                    style={{ background: otherOnline ? "#22d67a" : "rgba(255,255,255,0.25)" }}
                  />
                  {otherOnline ? "Online" : "Offline"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {[Phone, Video, MoreHorizontal].map((Icon, i) => (
            <motion.button
              key={i}
              whileHover={{ color: CYAN, background: "rgba(0,212,255,0.08)" }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,rgba(0,212,255,0.10),rgba(112,0,255,0.12))",
                border:     "1px solid rgba(0,212,255,0.20)",
              }}
            >
              <span className="text-xl">👋</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Say hello to {other?.name || "your contact"}!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(0,212,255,0.15))" }} />
              <span className="text-[9.5px] font-semibold tracking-[0.22em] uppercase" style={{ color: `${CYAN}55` }}>Today</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(0,212,255,0.15))" }} />
            </div>

            {messages.map((msg, i) => {
              const isMe      = msg.sender.id === myId;
              const prev      = messages[i - 1];
              const showGroup = !prev || prev.sender.id !== msg.sender.id;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={isMe}
                  index={i}
                  showAvatar={showGroup}
                  showName={showGroup && !isMe}
                  status={msg._status}
                />
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Typing indicator (below messages, above input) ── */}
      <AnimatePresence>
        {typingUser && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 4, height: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-end gap-2.5 px-4 pb-2 flex-shrink-0 overflow-hidden"
          >
            {other && <HexAvatar user={{ ...other, isOnline: otherOnline }} size={28} showOnline={false} />}
            <div
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl rounded-tl-sm"
              style={{
                background:     "rgba(255,255,255,0.055)",
                border:         `1px solid rgba(0,212,255,0.20)`,
                backdropFilter: "blur(12px)",
              }}
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{ background: CYAN, boxShadow: `0 0 4px ${CYAN}` }}
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                />
              ))}
              <span
                className="text-[10.5px] font-medium ml-1"
                style={{ color: `${CYAN}99` }}
              >
                {typingUser} is typing…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── E2E encryption label ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-1.5 py-1">
        <span
          className="text-[9px] tracking-wide select-none"
          style={{ color: `${CYAN}45` }}
        >
          🔒 Messages are end-to-end encrypted
        </span>
      </div>

      {/* ── Input ── */}
      <ChatInput onSend={handleSend} conversationId={conversationId} />
    </motion.div>
  );
}
