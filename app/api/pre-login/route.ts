import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const { email, password } = body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user?.hashedPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({
        error: "Account not verified. Check your email for the OTP or register again.",
      }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const otp = generateOtp();
    await prisma.user.update({
      where: { email: normalizedEmail },
      data:  { otpCode: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) },
    });

    try {
      await sendOtpEmail(normalizedEmail, otp, "login");
    } catch (emailErr) {
      console.error("[PRE-LOGIN] OTP email failed:", (emailErr as Error).message);
      // Still return success — user can resend from OTP page
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PRE-LOGIN] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
