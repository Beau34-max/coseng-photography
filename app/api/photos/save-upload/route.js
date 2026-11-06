import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { adminPhoto, getWatermarkSettings } from "@/lib/delivery";

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { galleryId, photos } = await req.json();
    if (!galleryId || !photos?.length) {
      return NextResponse.json({ error: "galleryId and photos required" }, { status: 400 });
    }

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ _id: new ObjectId(galleryId) });
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    const settings = await getWatermarkSettings(db);
    const saved = [];
    for (const p of photos) {
      const photo = {
        galleryId,
        publicId: p.public_id,
        url: p.secure_url,
        width: p.width,
        height: p.height,
        format: p.format,
        deliveryType: p.type === "authenticated" ? "authenticated" : "upload",
        caption: "",
        isCover: false,
        order: 0,
        uploadedAt: new Date(),
        uploadedBy: admin.email,
      };
      const ins = await db.collection("photos").insertOne(photo);
      saved.push(adminPhoto({ ...photo, _id: ins.insertedId }, settings));
    }

    await db.collection("galleries").updateOne(
      { _id: gallery._id },
      { $inc: { photoCount: saved.length }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, uploaded: saved });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
