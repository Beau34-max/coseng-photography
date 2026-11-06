import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { privateUploadsEnabled } from "@/lib/delivery";

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ error: "Cloudinary environment variables not configured" }, { status: 500 });
    }

    const body = await req.json();
    const galleryId = body.galleryId || null;
    if (galleryId && !/^[a-f0-9]{24}$/i.test(String(galleryId))) {
      return NextResponse.json({ error: "Invalid gallery id" }, { status: 400 });
    }
    const timestamp = Math.round(Date.now() / 1000);
    const folder = galleryId
      ? `coseng-photography/${galleryId}`
      : `coseng-photography/homepage`;

    // Gallery photos are uploaded as "authenticated" assets, so their original files cannot
    // be fetched by URL unless this server signs the link. Homepage showcase uploads stay public.
    const params = { folder, timestamp };
    const type = galleryId && privateUploadsEnabled() ? "authenticated" : null;
    if (type) params.type = type;
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      type,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
