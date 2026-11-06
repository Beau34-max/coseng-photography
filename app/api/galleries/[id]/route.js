import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { publicGallery, publicPhoto, getWatermarkSettings } from "@/lib/delivery";

export async function GET(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const admin = await getAdminFromRequest(req);

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ _id: new ObjectId(params.id) });
    // A private gallery looks exactly like a missing one to anyone who is not signed in.
    if (!gallery || (!admin && !gallery.isPublic)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const photos = await db.collection("photos")
      .find({ galleryId: params.id }).sort({ order: 1, uploadedAt: 1 }).toArray();

    if (!admin) {
      const settings = await getWatermarkSettings(db);
      return NextResponse.json({
        ...publicGallery(gallery),
        photos: photos.map((p) => publicPhoto(p, settings)),
      });
    }
    return NextResponse.json({
      ...gallery, _id: gallery._id.toString(),
      photos: photos.map((p) => ({ ...p, _id: p._id.toString() })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const db = await connectToDb();
    const { _id, ...update } = body;
    await db.collection("galleries").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...update, updatedAt: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = await connectToDb();
    await db.collection("photos").deleteMany({ galleryId: params.id });
    await db.collection("galleries").deleteOne({ _id: new ObjectId(params.id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
