"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams }  from "next/navigation";
import { useSession, signOut }   from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Settings, LogOut, UserPlus, X, Check } from "lucide-react";
import { getPusherClient }   from "@/lib/pusher";
import { HexAvatar }         from "@/components/ui/HexAvatar";
import { usePresence }        from "@/context/PresenceContext";
import type { ChatUser, ChatConversation, MessageNotification } from "@/types";

const CYAN   = "#00d4ff";
const PURPLE = "#7000ff";
const PINK   = "#ff2d78";
const GREEN  = "#22d67a";

/* ─── Welcome overlay ─────────────────────────────────────────────────── */
function WelcomeOverlay({ name }: { name: string }) {
  return (
    <div
      className="animate-welcome-fade pointer-events-none fixed top-5 left-1/2 z-[999] -translate-x-1/2"
      style={{ willChange: "opacity, transform" }}
    >
      <div
        className="px-6 py-3 rounded-2xl text-sm font-semibold tracking-wide whitespace-nowrap"
        style={{
          background:     "rgba(4,10,24,0.94)",
          backdropFilter: "blur(30px)",
          border:         `1px solid ${CYAN}50`,
          boxShadow:      `0 0 30px ${CYAN}22, 0 8px 32px rgba(0,0,0,0.6)`,
          color:          "rgba(255,255,255,0.92)",
          fontFamily:     "'Orbitron',monospace",
          letterSpacing:  "0.08em",
        }}
      >
        <span style={{ color: CYAN }}>⚡</span>&nbsp; Welcome back,&nbsp;
        <span style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}` }}>{name}</span>!
      </div>
    </div>
  );
}

/* ─── Logout toast ─────────────────────────────────────────────────────── */
function LogoutToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      exit={{   opacity: 0, y: -12,  scale: 0.96 }}
      transition={{ duration: 0.22 }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap"
      style={{
        background:     "rgba(4,10,24,0.96)",
        backdropFilter: "blur(30px)",
        border:         `1px solid rgba(34,214,122,0.40)`,
        boxShadow:      `0 0 28px rgba(34,214,122,0.18), 0 8px 32px rgba(0,0,0,0.6)`,
      }}
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(34,214,122,0.20)" }}>
        <Check className="w-3 h-3" style={{ color: GREEN }} />
      </div>
      <span className="text-[12px] font-semibold tracking-wide"
        style={{ color: "rgba(255,255,255,0.88)", fontFamily: "'Orbitron',monospace" }}>
        Logged out successfully!
      </span>
    </motion.div>
  );
}

/* ─── Unread badge ─────────────────────────────────────────────────────── */
function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
      style={{
        background: GREEN,
        boxShadow:  `0 0 8px ${GREEN}BB, 0 0 16px ${GREEN}55`,
        fontSize:   "9px",
        fontWeight: 700,
        color:      "#050505",
        lineHeight: 1,
      }}
    >
      {count > 99 ? "99+" : count}
    </motion.div>
  );
}

/* ─── Per-user notification state ──────────────────────────────────────── */
type ConvMeta = {
  conversationId: string;
  unreadCount:    number;
  lastMessage:    { body: string | null; image: string | null } | null;
};

export default function ConversationList() {
  const { data: session }    = useSession();
  const router               = useRouter();
  const routeParams          = useParams();
  const activeConvId         = routeParams?.conversationId as string | undefined;
  const myId                 = session?.user?.id;
  const { onlineIds, isOnlineId } = usePresence();

  const [users, setUsers]     = useState<ChatUser[]>([]);
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [showWelcome, setWelcome] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // userId → conversation metadata (unread count + last message)
  const [convMeta, setConvMeta] = useState<Map<string, ConvMeta>>(new Map());
  // conversationId → userId reverse lookup (for Pusher notifications)
  const convToUser = useRef<Map<string, string>>(new Map());

  /* ── Welcome overlay once per browser session ── */
  useEffect(() => {
    if (!session?.user?.name) return;
    const key = `nxc_welcomed_${myId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setWelcome(true);
      const t = setTimeout(() => setWelcome(false), 3000);
      return () => clearTimeout(t);
    }
  }, [session?.user?.name, myId]);

  /* ── Fetch users list ── */
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch conversations for unread counts + last message previews ── */
  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (!res.ok || !myId) return;
    const convs: ChatConversation[] = await res.json();

    const nextMeta  = new Map<string, ConvMeta>();
    const nextCtoU  = new Map<string, string>();

    for (const conv of convs) {
      const other = conv.users.find(u => u.id !== myId);
      if (!other) continue;
      nextMeta.set(other.id, {
        conversationId: conv.id,
        unreadCount:    conv.unreadCount ?? 0,
        lastMessage:    conv.lastMessage
          ? { body: conv.lastMessage.body, image: conv.lastMessage.image }
          : null,
      });
      nextCtoU.set(conv.id, other.id);
    }

    setConvMeta(nextMeta);
    convToUser.current = nextCtoU;
  }, [myId]);

  useEffect(() => {
    fetchUsers();
    fetchConversations();
  }, [fetchUsers, fetchConversations]);

  /* ── Refresh every 60 s ── */
  useEffect(() => {
    const id = setInterval(() => {
      fetchUsers();
      fetchConversations();
    }, 60_000);
    return () => clearInterval(id);
  }, [fetchUsers, fetchConversations]);

  /* ── Pusher: new user joined → refresh user list ── */
  useEffect(() => {
    const client = getPusherClient();
    if (!client || !myId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ch: any = client.subscribe("presence-nexchat");
    ch.bind("pusher:member_added", () => fetchUsers());
    return () => { client.unsubscribe("presence-nexchat"); };
  }, [myId, fetchUsers]);

  /* ── Pusher: private-user-{myId} → real-time unread badge updates ── */
  useEffect(() => {
    const client = getPusherClient();
    if (!client || !myId) return;

    const channelName = `private-user-${myId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ch: any = client.subscribe(channelName);

    ch.bind("new-notification", (data: MessageNotification) => {
      const { conversationId, message } = data;

      // Don't badge the conversation that's currently open
      if (conversationId === activeConvId) return;

      const userId = convToUser.current.get(conversationId);

      if (userId) {
        // Known conversation — increment badge
        setConvMeta(prev => {
          const next = new Map(prev);
          const existing = next.get(userId);
          if (existing) {
            next.set(userId, {
              ...existing,
              unreadCount: existing.unreadCount + 1,
              lastMessage: { body: message.body, image: message.image },
            });
          } else {
            next.set(userId, {
              conversationId,
              unreadCount: 1,
              lastMessage: { body: message.body, image: message.image },
            });
            convToUser.current.set(conversationId, userId);
          }
          return next;
        });
      } else {
        // First message from this person — full refresh to discover the new conversation
        fetchConversations();
        fetchUsers();
      }
    });

    return () => { client.unsubscribe(channelName); };
  }, [myId, activeConvId, fetchConversations, fetchUsers]);

  /* ── Auto-clear badge when user opens a conversation ── */
  useEffect(() => {
    if (!activeConvId) return;
    const userId = convToUser.current.get(activeConvId);
    if (!userId) return;

    // Reset badge locally immediately
    setConvMeta(prev => {
      const next = new Map(prev);
      const meta = next.get(userId);
      if (meta && meta.unreadCount > 0) {
        next.set(userId, { ...meta, unreadCount: 0 });
      }
      return next;
    });

    // Persist seen status to DB in the background
    fetch(`/api/conversations/${activeConvId}/seen`, { method: "PATCH" }).catch(() => {});
  }, [activeConvId]);

  /* ── Open / create conversation ── */
  const openConversation = async (userId: string) => {
    setOpening(userId);

    // Optimistically clear badge
    setConvMeta(prev => {
      const next = new Map(prev);
      const meta = next.get(userId);
      if (meta) next.set(userId, { ...meta, unreadCount: 0 });
      return next;
    });

    try {
      const res = await fetch("/api/conversations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      if (res.ok) {
        const conv = await res.json();
        // Mark seen immediately
        fetch(`/api/conversations/${conv.id}/seen`, { method: "PATCH" }).catch(() => {});
        router.push(`/conversations/${conv.id}`);
      }
    } finally {
      setOpening(null);
    }
  };

  /* ── Logout with toast ── */
  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 1400));
    signOut({ callbackUrl: "/login" });
  };

  const isOnline = (u: ChatUser) => isOnlineId(u.id, !!u.isOnline);

  const filtered = users.filter(u =>
    !query ||
    u.name?.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const me = session?.user;
  const meUser: ChatUser | null = me
    ? { id: me.id, name: me.name ?? null, email: me.email ?? "", image: me.image ?? null, isOnline: true }
    : null;

  return (
    <>
      <AnimatePresence>
        {showWelcome && session?.user?.name && <WelcomeOverlay name={session.user.name} />}
      </AnimatePresence>
      <AnimatePresence>
        {loggingOut && <LogoutToast />}
      </AnimatePresence>

      <div
        className="flex flex-col h-full w-full"
        style={{
          background:           "rgba(4,10,24,0.82)",
          backdropFilter:       "blur(42px)",
          WebkitBackdropFilter: "blur(42px)",
          borderRight:          "1px solid rgba(0,212,255,0.13)",
          boxShadow:            "inset -1px 0 0 rgba(0,212,255,0.06)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg,${CYAN},${PURPLE})`, boxShadow: `0 0 16px ${CYAN}55` }}
            >
              <Zap className="w-4 h-4 text-[#050505]" fill="currentColor" />
            </div>
            <span
              className="font-black text-base tracking-[0.18em] uppercase"
              style={{
                fontFamily: "'Orbitron',monospace",
                color:      CYAN,
                textShadow: `0 0 18px ${CYAN}EE, 0 0 40px ${CYAN}66, 0 0 80px ${CYAN}22`,
              }}
            >
              NexChat
            </span>
          </div>
          <motion.button
            whileHover={{ color: CYAN }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "rgba(255,255,255,0.28)" }}
            title="Add contact"
          >
            <UserPlus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* ── Search ── */}
        <div className="px-3 py-3 flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 pointer-events-none"
              style={{ color: "rgba(0,212,255,0.40)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs text-white outline-none placeholder:text-white/25 transition-all duration-200"
              style={{ background: "rgba(0,14,34,0.62)", border: "1px solid rgba(0,212,255,0.18)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 text-white/30 hover:text-white/60">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Online count ── */}
        <div className="px-4 pb-2 flex-shrink-0">
          <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase" style={{ color: `${CYAN}55` }}>
            {onlineIds.size > 0
              ? `${users.filter(u => onlineIds.has(u.id)).length} online`
              : `${users.filter(u => !!u.isOnline).length} online`}
          </span>
        </div>

        {/* ── User list ── */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
                <div className="w-11 h-11 rounded-lg bg-white/[0.05] flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-white/[0.05] rounded w-24 mb-2" />
                  <div className="h-2 bg-white/[0.03] rounded w-32" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs mt-10" style={{ color: "rgba(255,255,255,0.20)" }}>
              {query ? "No users found" : "No contacts yet"}
            </p>
          ) : (
            <AnimatePresence>
              {filtered.map((user, i) => {
                const online  = isOnline(user);
                const busy    = opening === user.id;
                const meta    = convMeta.get(user.id);
                const unread  = meta?.unreadCount ?? 0;
                const lastMsg = meta?.lastMessage ?? null;
                const isActive = meta?.conversationId === activeConvId;

                return (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => !busy && openConversation(user.id)}
                    disabled={busy}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 disabled:opacity-60"
                    whileHover={{ background: "rgba(0,212,255,0.07)", borderColor: "rgba(0,212,255,0.16)" }}
                    style={{
                      border:     "1px solid transparent",
                      background: isActive ? "rgba(0,212,255,0.06)" : "transparent",
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <HexAvatar user={{ ...user, isOnline: online }} size={44} showOnline />

                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="block text-[13px] font-semibold text-white/90 truncate">
                          {user.name || user.email.split("@")[0]}
                        </span>
                        <UnreadBadge count={unread} />
                      </div>

                      {/* Status / last message row */}
                      {unread > 0 && lastMsg ? (
                        /* Unread: show last message preview in neon green */
                        <p
                          className="text-[10.5px] font-semibold truncate mt-0.5"
                          style={{ color: GREEN }}
                        >
                          {lastMsg.image ? "📷 Photo" : (lastMsg.body ?? "")}
                        </p>
                      ) : (
                        /* No unread: show online/offline dot */
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${online ? "animate-pulse-online" : ""}`}
                            style={{ background: online ? GREEN : "rgba(255,255,255,0.22)" }}
                          />
                          <span
                            className="text-[10.5px] font-medium"
                            style={{ color: online ? "rgba(34,214,122,0.82)" : "rgba(255,255,255,0.30)" }}
                          >
                            {online ? "Online" : lastMsg?.body
                              ? <span className="truncate">{lastMsg.body}</span>
                              : "Away"}
                          </span>
                        </div>
                      )}
                    </div>

                    {busy && (
                      <div
                        className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
                        style={{ borderColor: `${CYAN}55`, borderTopColor: CYAN }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ── Bottom: current user profile ── */}
        <div
          className="flex-shrink-0 mx-2 mb-2 px-3 py-3 rounded-xl"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.10)" }}
        >
          <div className="text-[8.5px] font-bold tracking-[0.3em] uppercase mb-2" style={{ color: `${CYAN}50` }}>
            Your Profile
          </div>
          <div className="flex items-center gap-2.5">
            {meUser && <HexAvatar user={meUser} size={36} showOnline />}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/90 truncate">{me?.name || "You"}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-online" style={{ background: GREEN }} />
                <span className="text-[9.5px]" style={{ color: "rgba(34,214,122,0.78)" }}>Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)" }}>
                <Settings className="w-3.5 h-3.5" />
              </div>
              <motion.button
                whileHover={{ color: PINK }}
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ color: "rgba(255,255,255,0.28)" }}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
