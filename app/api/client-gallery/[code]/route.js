import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";

export async function GET(req, { params }) {
  try {
    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: params.code });
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    const photos = await db.collection("photos")
      .find({ galleryId: gallery._id.toString() }).sort({ order: 1, uploadedAt: 1 }).toArray();

    await db.collection("galleries").updateOne(
      { _id: gallery._id },
      { $inc: { viewCount: 1 } }
    );

    return NextResponse.json({
      gallery: { ...gallery, _id: gallery._id.toString() },
      photos: photos.map((p) => ({ ...p, _id: p._id.toString() })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
