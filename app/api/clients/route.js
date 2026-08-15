import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = await connectToDb();
    const clients = await db.collection("clients").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(clients.map((c) => ({ ...c, _id: c._id.toString() })));
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
    const { name, email, phone, notes } = body;
    if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });
    const db = await connectToDb();
    const result = await db.collection("clients").insertOne({
      name, email, phone: phone || "", notes: notes || "",
      createdAt: new Date(), bookingCount: 0,
    });
    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
