import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ObjectId } from "mongodb";
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
    gallery = { ...g, _id: g._id.toString() };
    photos = p.map((x) => ({ ...x, _id: x._id.toString() }));
  } catch { notFound(); }

  return <GalleryEditor gallery={gallery} photos={photos} />;
}
