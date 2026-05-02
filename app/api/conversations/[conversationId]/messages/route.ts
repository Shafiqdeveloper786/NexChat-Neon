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
      where:   { conversationId: params.conversationId },
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
    const myId = session.user.id;

    const data = await req.json().catch(() => ({}));
    const { body: text, image, fileUrl, fileType } = data;

    if (!text?.trim() && !image && !fileUrl) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Fetch conversation to find recipient (before transaction for clarity)
    const conv = await prisma.conversation.findUnique({
      where:  { id: params.conversationId },
      select: { userIds: true },
    });
    const recipientId = conv?.userIds.find(id => id !== myId) ?? null;

    // Save message + bump lastMessageAt atomically
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          body:         text?.trim() || null,
          image:        image    || null,
          fileUrl:      fileUrl  || null,
          fileType:     fileType || null,
          conversation: { connect: { id: params.conversationId } },
          sender:       { connect: { id: myId } },
        },
        include: { sender: { select: { id: true, name: true, image: true } } },
      }),
      prisma.conversation.update({
        where: { id: params.conversationId },
        data:  { lastMessageAt: new Date() },
      }),
    ]);

    if (pusherServer) {
      // 1. Broadcast full message to the conversation channel (both participants)
      pusherServer
        .trigger(`conversation-${params.conversationId}`, "new-message", message)
        .catch(e => console.warn("[PUSHER MSG]", e));

      // 2. Send a lightweight notification on the recipient's private channel.
      //    This powers the unread badge in the sidebar without re-fetching.
      if (recipientId) {
        pusherServer
          .trigger(`private-user-${recipientId}`, "new-notification", {
            conversationId: params.conversationId,
            message: {
              body:      message.body,
              image:     message.image,
              fileType:  message.fileType,
              createdAt: message.createdAt.toISOString(),
              sender:    { id: myId, name: session.user.name ?? null },
              senderId:  myId,
            },
          })
          .catch(e => console.warn("[PUSHER NOTIFY]", e));
      }
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("[MESSAGES POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
