import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { deletePhoto } from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await connectToDb();
    const photo = await db.collection("photos").findOne({ _id: new ObjectId(params.id) });
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deletePhoto(photo.publicId);
    await db.collection("photos").deleteOne({ _id: photo._id });
    await db.collection("galleries").updateOne(
      { _id: new ObjectId(photo.galleryId) },
      { $inc: { photoCount: -1 }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const db = await connectToDb();
    await db.collection("photos").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: body }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
