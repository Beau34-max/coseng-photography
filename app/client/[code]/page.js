import { connectToDb } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import ClientGalleryClient from "./ClientGalleryClient";

async function getClientGallery(code) {
  try {
    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: code });
    if (!gallery) return null;
    const photos = await db.collection("photos")
      .find({ galleryId: gallery._id.toString() })
      .sort({ order: 1, uploadedAt: 1 })
      .toArray();

    await db.collection("galleries").updateOne(
      { _id: gallery._id },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } }
    );

    return {
      gallery: { ...gallery, _id: gallery._id.toString() },
      photos: photos.map((p) => ({ ...p, _id: p._id.toString() })),
    };
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const data = await getClientGallery(params.code);
  if (!data) return {};
  return { title: `${data.gallery.title} — Your Gallery` };
}

export default async function ClientGalleryPage({ params }) {
  const data = await getClientGallery(params.code);
  if (!data) notFound();
  return (
    <ClientGalleryClient
      gallery={data.gallery}
      photos={data.photos}
      accessCode={params.code}
    />
  );
}
