import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { uploadPhoto } from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const galleryId = formData.get("galleryId");
    const files = formData.getAll("photos");

    if (!galleryId || !files.length) {
      return NextResponse.json({ error: "galleryId and photos required" }, { status: 400 });
    }

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ _id: new (await import("mongodb")).ObjectId(galleryId) });
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    const uploaded = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await uploadPhoto(base64, `coseng-photography/${galleryId}`);
      const photo = {
        galleryId, publicId: result.publicId,
        url: result.url, width: result.width, height: result.height,
        format: result.format, caption: "", isCover: false, order: 0,
        uploadedAt: new Date(), uploadedBy: admin.email,
      };
      const ins = await db.collection("photos").insertOne(photo);
      uploaded.push({ ...photo, _id: ins.insertedId.toString() });
    }

    await db.collection("galleries").updateOne(
      { _id: gallery._id },
      { $inc: { photoCount: uploaded.length }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true, uploaded });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
