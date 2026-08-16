import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }

    const db = await connectToDb();
    const existing = await db.collection("admins").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection("admins").insertOne({
      name,
      email,
      passwordHash,
      role: role || "staff",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
