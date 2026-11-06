import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { adminPhoto, getWatermarkSettings } from "@/lib/delivery";
import GalleryEditor from "./GalleryEditor";

export async function generateMetadata({ params }) {
  try {
    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ _id: new ObjectId(params.id) });
    return { title: gallery?.title || "Gallery" };
  } catch { return { title: "Gallery" }; }
}

export default async function GalleryDetailPage({ params }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  let gallery, photos;
  try {
    const db = await connectToDb();
    const g = await db.collection("galleries").findOne({ _id: new ObjectId(params.id) });
    if (!g) notFound();
    const p = await db.collection("photos")
      .find({ galleryId: params.id }).sort({ order: 1, uploadedAt: 1 }).toArray();
    const wm = await getWatermarkSettings(db);
    gallery = { ...g, _id: g._id.toString() };
    // adminUrl / coverUrl are signed copies, so the editor works for private (authenticated) photos too.
    photos = p.map((x) => adminPhoto(x, wm));
  } catch { notFound(); }

  return <GalleryEditor gallery={gallery} photos={photos} />;
}
