import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

/* ── helpers ──────────────────────────────────────────────────────────── */

function isCloudinaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return (
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.startsWith("your-") &&
    !CLOUDINARY_API_KEY.startsWith("your-")
  );
}

async function uploadAvatar(base64: string): Promise<string | undefined> {
  if (!isCloudinaryConfigured()) return undefined;
  try {
    // Dynamic import so Cloudinary SDK is only loaded when configured
    const { default: cloudinary } = await import("@/lib/cloudinary");
    const result = await cloudinary.uploader.upload(base64, {
      folder: "nexchat/avatars",
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    });
    return result.secure_url;
  } catch (err) {
    console.warn("[REGISTER] Cloudinary upload failed, skipping avatar:", (err as Error).message);
    return undefined;
  }
}

/* ── POST /api/register ───────────────────────────────────────────────── */

export async function POST(req: Request) {
  try {
    /* 1 ── Parse & validate body */
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, password, image } = body as {
      name?: string; email?: string; password?: string; image?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    /* 2 ── Check for existing user */
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    /* 3 ── Hash password */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* 4 ── Upload avatar (optional — skipped if Cloudinary not configured) */
    const imageUrl = image ? await uploadAvatar(image) : undefined;

    /* 5 ── Generate OTP */
    const otp       = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    /* 6 ── Create user in DB */
    await prisma.user.create({
      data: {
        name:          name.trim(),
        email:         email.toLowerCase().trim(),
        hashedPassword,
        image:         imageUrl ?? null,
        otpCode:       otp,
        otpExpiry,
        emailVerified: null,
      },
    });

    /* 7 ── Send OTP email */
    try {
      await sendOtpEmail(email.toLowerCase().trim(), otp, "verify");
    } catch (emailErr) {
      // User is created — log the email failure but don't fail the request.
      // The verify-otp page has a "Resend" button they can use.
      console.error("[REGISTER] OTP email failed (user still created):", (emailErr as Error).message);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[REGISTER] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
