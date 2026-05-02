import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

type Ctx = { params: { conversationId: string } };

// PATCH /api/conversations/[conversationId]/seen
// Adds the current user's ID to seenIds for every unread message in the conversation.
export async function PATCH(_req: Request, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const myId = session.user.id;

    // Only update messages that are not yet seen by this user
    await prisma.message.updateMany({
      where: {
        conversationId: params.conversationId,
        senderId:       { not: myId },
        NOT:            { seenIds: { has: myId } },
      },
      data: {
        seenIds: { push: myId },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[SEEN PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
