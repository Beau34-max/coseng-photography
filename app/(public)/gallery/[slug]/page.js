import { connectToDb } from "@/lib/mongodb";
import { publicGallery, publicPhoto, getWatermarkSettings } from "@/lib/delivery";
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
    const wm = await getWatermarkSettings(db);
    // Only publishable fields and watermarked copies leave the server: no access code,
    // no client details, no original file addresses.
    return {
      gallery: publicGallery(g),
      photos: photos.map((p) => publicPhoto(p, wm)),
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
