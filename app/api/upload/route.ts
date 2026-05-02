import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import cloudinary from "@/lib/cloudinary";

function cloudinaryReady() {
  const n = process.env.CLOUDINARY_CLOUD_NAME;
  return !!n && !n.startsWith("your-");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cloudinaryReady()) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
  }

  try {
    const { file, folder = "nexchat/chat" } = await req.json().catch(() => ({}));
    if (!file) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(file as string, {
      folder,
      resource_type: "auto",
      quality:        "auto",
      fetch_format:   "auto",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[UPLOAD]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
