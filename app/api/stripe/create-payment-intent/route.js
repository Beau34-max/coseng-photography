import { NextResponse } from "next/server";
import Stripe from "stripe";
import { findPackage } from "@/lib/packages";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req) {
  try {
    const limit = rateLimit(`intent:${clientIp(req.headers)}`, { limit: 20, windowMs: 60 * 60 * 1000 });
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    }

    // Only a package is accepted. The price is read on the server; any "amount" in the
    // request is ignored, so a visitor cannot choose what they pay.
    const { packageId, packageName, clientName } = await req.json();
    const pkg = await findPackage({ packageId, packageName });
    if (!pkg) return NextResponse.json({ error: "Unknown package" }, { status: 400 });

    const pence = Math.round(pkg.price * 100);
    if (pence < 100) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pence,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: {
        packageId: String(pkg.id ?? ""),
        packageName: pkg.name,
        clientName: typeof clientName === "string" ? clientName.slice(0, 120) : "",
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
