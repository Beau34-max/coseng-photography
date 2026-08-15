import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const publicOnly = searchParams.get("public") === "true";

    const db = await connectToDb();
    const filter = {};
    if (publicOnly) filter.isPublic = true;
    if (category && category !== "all") filter.category = category;

    const galleries = await db.collection("galleries")
      .find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(galleries.map((g) => ({ ...g, _id: g._id.toString() })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, slug, category, description, clientName, clientEmail, accessCode, isPublic } = body;
    if (!title || !slug) return NextResponse.json({ error: "Title and slug required" }, { status: 400 });

    const db = await connectToDb();
    const existing = await db.collection("galleries").findOne({ slug });
    if (existing) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

    const result = await db.collection("galleries").insertOne({
      title, slug, category: category || "other",
      description: description || "",
      clientName: clientName || "", clientEmail: clientEmail || "",
      accessCode: accessCode || null,
      isPublic: !!isPublic,
      photoCount: 0, viewCount: 0, coverImage: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
