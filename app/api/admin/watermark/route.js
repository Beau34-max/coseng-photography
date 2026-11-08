import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { connectToDb } from "@/lib/mongodb";

const DEFAULTS = {
  text: "COSENG Photography",
  font: "Arial",
  size: 80,
  opacity: 40,
  angle: -20,
};

export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await connectToDb();
    const doc = await db.collection("settings").findOne({ key: "watermark" });
    return NextResponse.json({ ...DEFAULTS, ...(doc || {}), key: undefined });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, font, size, opacity, angle } = await req.json();
    const db = await connectToDb();

    await db.collection("settings").updateOne(
      { key: "watermark" },
      { $set: { key: "watermark", text, font, size, opacity, angle, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
