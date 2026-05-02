import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to avoid user enumeration
    if (!user || !user.hashedPassword) {
      return NextResponse.json({ success: true });
    }

    const otp = generateOtp();
    await prisma.user.update({
      where: { email },
      data: {
        otpCode:   otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtpEmail(email, otp, "reset");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[FORGOT-PASSWORD]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
