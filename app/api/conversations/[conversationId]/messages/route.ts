import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

type Ctx = { params: { conversationId: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.conversationId },
      include: { sender: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[MESSAGES GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json().catch(() => ({}));
    const { body: text, image, fileUrl, fileType } = data;

    if (!text?.trim() && !image && !fileUrl) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          body:         text?.trim() || null,
          image:        image    || null,
          fileUrl:      fileUrl  || null,
          fileType:     fileType || null,
          conversation: { connect: { id: params.conversationId } },
          sender:       { connect: { id: session.user.id } },
        },
        include: { sender: { select: { id: true, name: true, image: true } } },
      }),
      prisma.conversation.update({
        where: { id: params.conversationId },
        data:  { lastMessageAt: new Date() },
      }),
    ]);

    // Broadcast via Pusher if configured
    if (pusherServer) {
      await pusherServer
        .trigger(`conversation-${params.conversationId}`, "new-message", message)
        .catch(e => console.warn("[PUSHER TRIGGER]", e));
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("[MESSAGES POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
