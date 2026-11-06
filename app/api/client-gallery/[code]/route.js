import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Used by the "enter your code" page to check that a code exists. It confirms the code
// and returns nothing else. The gallery itself is rendered on the server at /client/[code].
export async function GET(req, { params }) {
  try {
    const limit = rateLimit(`code:${clientIp(req.headers)}`, { limit: 15, windowMs: 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const code = String(params.code || "");
    if (!code) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    const db = await connectToDb();
    const gallery = await db.collection("galleries").findOne({ accessCode: code }, { projection: { _id: 1 } });
    if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
