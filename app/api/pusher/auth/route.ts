import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  if (!pusherServer) {
    return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const text        = await req.text();
    const params      = new URLSearchParams(text);
    const socketId    = params.get("socket_id")!;
    const channelName = params.get("channel_name")!;

    const auth = pusherServer.authorizeChannel(socketId, channelName, {
      user_id:   session.user.id,
      user_info: {
        name:  session.user.name  ?? "Anonymous",
        image: session.user.image ?? null,
      },
    });

    return NextResponse.json(auth);
  } catch (err) {
    console.error("[PUSHER AUTH]", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
