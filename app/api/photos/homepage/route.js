import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDb();

    // First: individually pinned photos
    const pinned = await db
      .collection("photos")
      .find({ showOnHomepage: true })
      .sort({ uploadedAt: -1 })
      .limit(20)
      .toArray();

    if (pinned.length >= 3) {
      return NextResponse.json(pinned.map((p) => ({ ...p, _id: p._id.toString() })));
    }

    // Fallback: cover images from featured galleries
    const featured = await db
      .collection("galleries")
      .find({ featured: true, coverImage: { $exists: true, $ne: "" } })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    const coverSlides = featured
      .filter((g) => g.coverImage)
      .map((g) => ({
        _id: g._id.toString(),
        url: g.coverImage,
        caption: g.title,
        showOnHomepage: true,
      }));

    // Merge: pinned first, then gallery covers (deduplicate by url)
    const seen = new Set(pinned.map((p) => p.url));
    const combined = [
      ...pinned.map((p) => ({ ...p, _id: p._id.toString() })),
      ...coverSlides.filter((s) => !seen.has(s.url)),
    ];

    return NextResponse.json(combined);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
