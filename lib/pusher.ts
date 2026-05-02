import PusherServer from "pusher";
import PusherClient from "pusher-js";

/* ── Check if credentials are real (not placeholders) ─────────────────── */
function serverReady() {
  const id = process.env.PUSHER_APP_ID;
  return !!id && !id.startsWith("your-");
}

function clientReady() {
  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  return !!key && !key.startsWith("your-");
}

/* ── Server instance (null when unconfigured) ──────────────────────────── */
export const pusherServer: PusherServer | null = serverReady()
  ? new PusherServer({
      appId:   process.env.PUSHER_APP_ID!,
      key:     process.env.PUSHER_APP_KEY!,
      secret:  process.env.PUSHER_APP_SECRET!,
      cluster: process.env.PUSHER_APP_CLUSTER || "ap2",
      useTLS:  true,
    })
  : null;

/* ── Client factory (lazy, browser-only) ───────────────────────────────── */
let _client: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined" || !clientReady()) return null;
  if (!_client) {
    _client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster:      process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "ap2",
      authEndpoint: "/api/pusher/auth",
    });
  }
  return _client;
}
