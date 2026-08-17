import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectToDb();

    // Primary: dedicated homepage carousel photos (managed via Admin → Homepage)
    const settings = await db.collection("settings").findOne({ key: "homepage" });
    if (settings?.carousel?.length > 0) {
      return NextResponse.json(
        settings.carousel.map((p) => ({
          _id: p.id,
          url: p.url,
          caption: p.label || "Our Work",
        }))
      );
    }

    // Fallback: photos individually pinned via gallery admin
    const pinned = await db
      .collection("photos")
      .find({ showOnHomepage: true })
      .sort({ uploadedAt: -1 })
      .limit(20)
      .toArray();

    if (pinned.length > 0) {
      return NextResponse.json(pinned.map((p) => ({ ...p, _id: p._id.toString() })));
    }

    // Last resort: cover images from featured galleries
    const featured = await db
      .collection("galleries")
      .find({ featured: true, coverImage: { $exists: true, $ne: "" } })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    const combined = featured
      .filter((g) => g.coverImage)
      .map((g) => ({
        _id: g._id.toString(),
        url: g.coverImage,
        caption: g.title,
      }));

    return NextResponse.json(combined);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
