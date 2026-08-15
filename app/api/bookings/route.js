import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "@/lib/email";

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

export async function POST(req) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, clientPhone, packageName, packageId, sessionDate, notes, amount, stripePaymentIntentId } = body;
    if (!clientName || !clientEmail || !packageName) {
      return NextResponse.json({ error: "clientName, clientEmail and packageName required" }, { status: 400 });
    }
    const db = await connectToDb();
    const booking = {
      clientName, clientEmail, clientPhone: clientPhone || "",
      packageName, packageId: packageId || null,
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      notes: notes || "", amount: amount || 0,
      stripePaymentIntentId: stripePaymentIntentId || null,
      paymentStatus: stripePaymentIntentId ? "paid" : "pending",
      status: "confirmed", createdAt: new Date(),
    };
    const result = await db.collection("bookings").insertOne(booking);

    Promise.resolve().then(async () => {
      try { await sendBookingConfirmationEmail(clientEmail, { clientName, packageName, sessionDate, amount }); } catch {}
      try { await sendBookingNotificationEmail({ clientName, clientEmail, packageName, sessionDate, amount }); } catch {}
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
