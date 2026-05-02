import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, resetToken, password } = await req.json();

    if (!email || !resetToken || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otpCode !== `reset_${resetToken}` ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        hashedPassword,
        otpCode:   null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RESET-PASSWORD]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
