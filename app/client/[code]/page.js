import { cache } from "react";
import { headers, cookies } from "next/headers";
import { connectToDb } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import { clientGallery, clientPhoto, getWatermarkSettings } from "@/lib/delivery";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createHmac } from "crypto";
import ClientGalleryClient from "./ClientGalleryClient";
import PinGate from "./PinGate";

function cookieToken(code, pin) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "cgphoto_pin_secret_fallback";
  return createHmac("sha256", secret).update(`${code}:${pin}`).digest("hex");
}

export const dynamic = "force-dynamic";

// cache() makes the page and generateMetadata share one lookup per request,
// so a visit is counted once and uses one rate-limit slot.
const getClientGallery = cache(async (code) => {
  try {
    // Stops anyone guessing access codes by trying URLs quickly.
    const limit = rateLimit(`client-page:${clientIp(headers())}`, { limit: 30, windowMs: 60 * 1000 });
    if (!limit.ok) return null;

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

    const wm = await getWatermarkSettings(db);
    // Resized copies only. Originals are fetched through the code-checked download route.
    return {
      gallery: clientGallery(gallery),
      photos: photos.map((p) => clientPhoto(p, gallery, wm)),
      _clientAccess: gallery.clientAccess || "open",
      _clientPin: gallery.clientPin || "",
    };
  } catch { return null; }
});

export async function generateMetadata({ params }) {
  const data = await getClientGallery(params.code);
  if (!data) return {};
  return { title: `${data.gallery.title} — Your Gallery`, robots: { index: false, follow: false } };
}

export default async function ClientGalleryPage({ params }) {
  const data = await getClientGallery(params.code);
  if (!data) notFound();

  // If gallery is PIN-protected, verify the auth cookie before showing photos
  if (data._clientAccess === "pin" && data._clientPin) {
    const cookieStore = cookies();
    const cookie = cookieStore.get(`cgp_${params.code}`)?.value;
    const expected = cookieToken(params.code, data._clientPin);
    if (cookie !== expected) {
      return <PinGate code={params.code} galleryTitle={data.gallery.title} />;
    }
  }

  return (
    <ClientGalleryClient
      gallery={data.gallery}
      photos={data.photos}
      accessCode={params.code}
    />
  );
}
