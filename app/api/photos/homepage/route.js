import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDb();
    const photos = await db
      .collection("photos")
      .find({ showOnHomepage: true })
      .sort({ uploadedAt: -1 })
      .limit(20)
      .toArray();
    return NextResponse.json(
      photos.map((p) => ({ ...p, _id: p._id.toString() }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
