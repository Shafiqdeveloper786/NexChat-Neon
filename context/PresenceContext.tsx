"use client";

import {
  createContext, useCallback, useContext,
  useEffect, useState,
} from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher";

interface PresenceCtx {
  onlineIds: Set<string>;
  /** Returns true when userId is online, using Pusher if connected else DB flag. */
  isOnlineId: (userId: string, dbFlag?: boolean) => boolean;
}

const PresenceContext = createContext<PresenceCtx>({
  onlineIds:  new Set(),
  isOnlineId: (_id, dbFlag) => !!dbFlag,
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { data: session }         = useSession();
  const myId                      = session?.user?.id;
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  /* ── 30 s heartbeat: keep self online in DB ── */
  useEffect(() => {
    const ping = () =>
      fetch("/api/users", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isOnline: true }),
      });
    ping();
    const timer = setInterval(ping, 30_000);
    const bye   = () => navigator.sendBeacon?.("/api/users");
    window.addEventListener("beforeunload", bye);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", bye);
    };
  }, []);

  /* ── Pusher presence-nexchat ── */
  useEffect(() => {
    const client = getPusherClient();
    if (!client || !myId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ch: any = client.subscribe("presence-nexchat");

    ch.bind(
      "pusher:subscription_succeeded",
      (m: { each: (fn: (x: { id: string }) => void) => void }) => {
        const ids: string[] = [];
        m.each((x: { id: string }) => ids.push(x.id));
        setOnlineIds(new Set(ids));
      },
    );
    ch.bind("pusher:member_added", (m: { id: string }) => {
      setOnlineIds(prev => new Set([...Array.from(prev), m.id]));
    });
    ch.bind("pusher:member_removed", (m: { id: string }) => {
      setOnlineIds(prev => {
        const s = new Set(Array.from(prev));
        s.delete(m.id);
        return s;
      });
    });

    return () => { client.unsubscribe("presence-nexchat"); };
  }, [myId]);

  const isOnlineId = useCallback(
    (userId: string, dbFlag?: boolean) => {
      const connected = onlineIds.size > 0;
      return connected ? onlineIds.has(userId) : !!dbFlag;
    },
    [onlineIds],
  );

  return (
    <PresenceContext.Provider value={{ onlineIds, isOnlineId }}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
