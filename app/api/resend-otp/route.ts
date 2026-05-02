import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, mode } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always succeed to avoid enumeration; only actually send if user exists
    if (!user) return NextResponse.json({ success: true });

    const otp = generateOtp();
    await prisma.user.update({
      where: { email },
      data: {
        otpCode:   otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailMode = mode === "verify" ? "verify" : mode === "reset" ? "reset" : "login";
    await sendOtpEmail(email, otp, emailMode as "verify" | "login" | "reset");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[RESEND-OTP]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
