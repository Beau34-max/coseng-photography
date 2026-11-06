import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";
import { findPackage } from "@/lib/packages";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import Stripe from "stripe";

export async function GET(req) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = await connectToDb();
    const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(bookings.map((b) => ({ ...b, _id: b._id.toString() })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// A payment only counts if Stripe itself says it succeeded for exactly this package price.
async function verifyPayment(paymentIntentId, expectedPence) {
  if (!process.env.STRIPE_SECRET_KEY) return { ok: false, status: 503, error: "Payments are not configured" };
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const valid =
      intent.status === "succeeded" &&
      intent.currency === "gbp" &&
      intent.amount_received === expectedPence;
    return valid ? { ok: true } : { ok: false, status: 400, error: "Payment could not be verified" };
  } catch (err) {
    console.error("Stripe verify error:", err.message);
    return { ok: false, status: 400, error: "Payment could not be verified" };
  }
}

export async function POST(req) {
  try {
    const limit = rateLimit(`booking:${clientIp(req.headers)}`, { limit: 10, windowMs: 60 * 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }

    const body = await req.json();
    const clientName = text(body.clientName, 120);
    const clientEmail = text(body.clientEmail, 200).toLowerCase();
    const clientPhone = text(body.clientPhone, 40);
    const notes = text(body.notes, 2000);
    const stripePaymentIntentId = text(body.stripePaymentIntentId, 100);

    if (!clientName || !clientEmail || (!body.packageId && !body.packageName)) {
      return NextResponse.json({ error: "clientName, clientEmail and a package are required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(clientEmail)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    // The package, its name and its price come from the server. Anything the browser
    // sends for amount, price or payment status is ignored.
    const pkg = await findPackage({ packageId: body.packageId, packageName: body.packageName });
    if (!pkg) return NextResponse.json({ error: "Unknown package" }, { status: 400 });

    let sessionDate = null;
    if (body.sessionDate) {
      sessionDate = new Date(body.sessionDate);
      if (Number.isNaN(sessionDate.getTime())) {
        return NextResponse.json({ error: "Enter a valid session date" }, { status: 400 });
      }
    }

    const db = await connectToDb();

    let paymentStatus = "pending";
    let verifiedIntentId = null;
    if (stripePaymentIntentId) {
      const used = await db.collection("bookings").findOne({ stripePaymentIntentId });
      if (used) return NextResponse.json({ error: "This payment has already been used" }, { status: 409 });
      const check = await verifyPayment(stripePaymentIntentId, Math.round(pkg.price * 100));
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
      paymentStatus = "paid";
      verifiedIntentId = stripePaymentIntentId;
    }

    const booking = {
      clientName, clientEmail, clientPhone,
      packageName: pkg.name, packageId: pkg.id ?? null,
      sessionDate, notes, amount: pkg.price,
      stripePaymentIntentId: verifiedIntentId,
      paymentStatus,
      status: "confirmed", createdAt: new Date(),
    };
    const result = await db.collection("bookings").insertOne(booking);

    const emailData = { clientName, packageName: pkg.name, sessionDate, amount: pkg.price };
    Promise.resolve().then(async () => {
      try { await sendBookingConfirmationEmail(clientEmail, emailData); } catch {}
      try { await sendBookingNotificationEmail({ ...emailData, clientEmail }); } catch {}
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
