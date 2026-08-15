import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const db = await connectToDb();
    const admin = await db.collection("admins").findOne({ email: email.toLowerCase().trim() });
    if (!admin) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const token = await signToken({ id: admin._id.toString(), email: admin.email, name: admin.name, role: admin.role });

    const cookieStore = await cookies();
    cookieStore.set("photo_admin_session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });

    await db.collection("admins").updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

    return NextResponse.json({ ok: true, name: admin.name });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
