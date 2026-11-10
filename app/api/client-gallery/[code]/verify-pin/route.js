import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createHmac } from "crypto";

export function cookieToken(code, pin) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "cgphoto_pin_secret_fallback";
  return createHmac("sha256", secret).update(`${code}:${pin}`).digest("hex");
}

export async function POST(req, { params }) {
  try {
    const limit = rateLimit(`pin:${clientIp(req.headers)}`, { limit: 10, windowMs: 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    const { pin } = await req.json();
    if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne(
      { accessCode: params.code },
      { projection: { _id: 1, clientAccess: 1, clientPin: 1 } }
    );
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    if (gallery.clientAccess !== "pin") return NextResponse.json({ ok: true });

    if (String(gallery.clientPin || "").trim() !== String(pin).trim()) {
      return NextResponse.json({ error: "Incorrect PIN. Please try again." }, { status: 401 });
    }

    const token = cookieToken(params.code, gallery.clientPin);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(`cgp_${params.code}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: `/`,
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
