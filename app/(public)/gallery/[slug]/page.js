import { connectToDb } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import GalleryViewer from "./GalleryViewer";

export const revalidate = 60;

async function getGallery(slug) {
  try {
    const db = await connectToDb();
    const g = await db.collection("galleries").findOne({ slug, isPublic: true });
    if (!g) return null;
    const photos = await db.collection("photos")
      .find({ galleryId: g._id.toString() })
      .sort({ order: 1, uploadedAt: 1 })
      .toArray();
    return {
      gallery: { ...g, _id: g._id.toString() },
      photos: photos.map((p) => ({ ...p, _id: p._id.toString() })),
    };
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const data = await getGallery(params.slug);
  if (!data) return {};
  return { title: data.gallery.title, description: data.gallery.description };
}

export default async function GalleryPage({ params }) {
  const data = await getGallery(params.slug);
  if (!data) notFound();
  return <GalleryViewer gallery={data.gallery} photos={data.photos} />;
}
