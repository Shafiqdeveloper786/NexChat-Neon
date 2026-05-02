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

    const conversations = await prisma.conversation.findMany({
      where: { userIds: { has: session.user.id } },
      include: {
        users: {
          select: {
            id: true, name: true, email: true,
            image: true, isOnline: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return NextResponse.json(conversations);
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

    // Return existing 1-on-1 conversation if it already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { userIds: { has: session.user.id } },
          { userIds: { has: userId } },
          { isGroup: false },
        ],
      },
      include: {
        users: {
          select: { id: true, name: true, email: true, image: true, isOnline: true },
        },
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
        users: {
          select: { id: true, name: true, email: true, image: true, isOnline: true },
        },
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
