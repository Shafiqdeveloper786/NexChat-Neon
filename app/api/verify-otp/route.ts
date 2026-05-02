import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp, mode } = await req.json();

    if (!email || !otp || !mode) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (mode === "reset") {
      // Issue a short-lived reset token (10 min) stored in otpCode
      const resetToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { email },
        data: {
          otpCode:   `reset_${resetToken}`,
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      return NextResponse.json({ success: true, resetToken });
    }

    // mode === "verify" | "login" — mark email as verified and clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        otpCode:       null,
        otpExpiry:     null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[VERIFY-OTP]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
