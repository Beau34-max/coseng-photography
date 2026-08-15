import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";

export async function POST(req, { params }) {
  try {
    const { photoId, action } = await req.json();
    if (!photoId || !action) return NextResponse.json({ error: "photoId and action required" }, { status: 400 });

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: params.code });
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    const galleryId = gallery._id.toString();
    if (action === "add") {
      await db.collection("favourites").updateOne(
        { galleryId, photoId },
        { $set: { galleryId, photoId, code: params.code, savedAt: new Date() } },
        { upsert: true }
      );
    } else if (action === "remove") {
      await db.collection("favourites").deleteOne({ galleryId, photoId });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: params.code });
    if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const favourites = await db.collection("favourites")
      .find({ galleryId: gallery._id.toString() }).toArray();
    return NextResponse.json(favourites.map((f) => f.photoId));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
