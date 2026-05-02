import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        // Only exclude the requesting user — show everyone else regardless of
        // auth provider (Google users have no hashedPassword, so any provider-
        // based filter would silently drop them from the list).
        email: { not: session.user.email },
      },
      select: {
        id:       true,
        name:     true,
        email:    true,
        image:    true,
        isOnline: true,
        lastSeen: true,
      },
      orderBy: [{ isOnline: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("[USERS GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH — mark current user online/offline
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await req.json().catch(() => ({ isOnline: false }));

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[USERS PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
