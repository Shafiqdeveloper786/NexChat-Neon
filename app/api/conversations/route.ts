import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const myId = session.user.id;

    // 1. Fetch all conversations the user belongs to (includes last message)
    const conversations = await prisma.conversation.findMany({
      where:   { userIds: { has: myId } },
      include: {
        users: {
          select: { id: true, name: true, email: true, image: true, isOnline: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take:    1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // 2. Batch-fetch all unread message IDs in one query (no N+1)
    const unreadRaw = await prisma.message.findMany({
      where: {
        conversationId: { in: conversations.map(c => c.id) },
        senderId:       { not: myId },
        NOT:            { seenIds: { has: myId } },
      },
      select: { conversationId: true },
    });

    // Build conversationId → unreadCount map
    const unreadMap = new Map<string, number>();
    for (const { conversationId } of unreadRaw) {
      unreadMap.set(conversationId, (unreadMap.get(conversationId) ?? 0) + 1);
    }

    // 3. Shape the response
    const result = conversations.map(conv => {
      const raw = conv.messages[0] ?? null;
      return {
        id:            conv.id,
        name:          conv.name,
        isGroup:       conv.isGroup,
        lastMessageAt: conv.lastMessageAt,
        users:         conv.users,
        messages:      [],            // ChatWindow fetches its own messages
        unreadCount:   unreadMap.get(conv.id) ?? 0,
        lastMessage:   raw
          ? {
              body:      raw.body,
              image:     raw.image,
              fileType:  raw.fileType,
              createdAt: raw.createdAt,
              sender:    raw.sender,
            }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[CONVERSATIONS GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json().catch(() => ({}));
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { userIds: { has: session.user.id } },
          { userIds: { has: userId } },
          { isGroup: false },
        ],
      },
      include: {
        users:    { select: { id: true, name: true, email: true, image: true, isOnline: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (existing) return NextResponse.json(existing);

    const conversation = await prisma.conversation.create({
      data: {
        users: { connect: [{ id: session.user.id }, { id: userId }] },
      },
      include: {
        users:    { select: { id: true, name: true, email: true, image: true, isOnline: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (err) {
    console.error("[CONVERSATIONS POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
