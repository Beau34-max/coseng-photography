import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { connectToDb } from "@/lib/mongodb";

const DEFAULTS = {
  hero: {
    title: "Capturing Moments",
    titleAccent: "That Last Forever",
    subtitle:
      "Professional photography for portraits, events, commercial and community work. Delivering stunning images across Newcastle and the North East.",
    backgroundImage: null,
  },
  carousel: [],
};

export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await connectToDb();
    const doc = await db.collection("settings").findOne({ key: "homepage" });

    return NextResponse.json({
      hero: { ...DEFAULTS.hero, ...(doc?.hero || {}) },
      carousel: doc?.carousel || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const db = await connectToDb();

    await db.collection("settings").updateOne(
      { key: "homepage" },
      {
        $set: {
          key: "homepage",
          hero: body.hero,
          carousel: body.carousel,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
