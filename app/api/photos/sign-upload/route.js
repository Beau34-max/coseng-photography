import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ error: "Cloudinary environment variables not configured" }, { status: 500 });
    }

    const body = await req.json();
    const galleryId = body.galleryId || null;
    const timestamp = Math.round(Date.now() / 1000);
    const folder = galleryId
      ? `coseng-photography/${galleryId}`
      : `coseng-photography/homepage`;

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
