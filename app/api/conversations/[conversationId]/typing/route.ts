import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pusherServer } from "@/lib/pusher";

type Ctx = { params: { conversationId: string } };

export async function POST(req: Request, { params }: Ctx) {
  // No-op if Pusher not configured — typing indicator is a nice-to-have
  if (!pusherServer) return NextResponse.json({ ok: true });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isTyping } = await req.json().catch(() => ({ isTyping: false }));

    await pusherServer
      .trigger(`conversation-${params.conversationId}`, "typing", {
        userId:   session.user.id,
        userName: session.user.name || "Someone",
        isTyping: !!isTyping,
      })
      .catch(e => console.warn("[TYPING TRIGGER]", e));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TYPING]", err);
    return NextResponse.json({ ok: true }); // Non-critical — always succeed
  }
}
