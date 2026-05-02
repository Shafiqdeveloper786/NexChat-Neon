import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// GET /api/debug — returns raw DB record for the current user + full users list
// Only active in development. Remove or protect behind an admin check in production.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);

  const me = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  const allUsers = await prisma.user.findMany({
    select: {
      id:            true,
      name:          true,
      email:         true,
      emailVerified: true,
      isOnline:      true,
      hashedPassword: true,
      accounts:      { select: { provider: true } },
    },
  });

  return NextResponse.json({
    session,
    myDbRecord: me,
    allUsers,
  });
}
