import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongodb";
import { originalDownloadUrl } from "@/lib/delivery";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// The only public way to reach an original file. The visitor must hold the gallery's
// access code, and is sent to a link that expires after a few minutes.
//   GET /api/client-gallery/<code>/download?photo=<photoId>
export async function GET(req, { params }) {
  try {
    const limit = rateLimit(`download:${clientIp(req.headers)}`, { limit: 60, windowMs: 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const photoId = new URL(req.url).searchParams.get("photo");
    const code = String(params.code || "");
    if (!code || !photoId || !ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: code }, { projection: { _id: 1 } });
    if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const photo = await db.collection("photos").findOne({
      _id: new ObjectId(photoId),
      galleryId: gallery._id.toString(),
    });
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = originalDownloadUrl(photo, 300);
    if (!url) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const res = NextResponse.redirect(url, 302);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
