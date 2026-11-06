import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email and message required" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const { error } = await resend.emails.send({
      from: "COSENG Photography <noreply@coseng.co.uk>",
      to: "photography@coseng.co.uk",
      reply_to: email,
      subject: `Contact Form: ${subject || "New enquiry"}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
          <div style="background:#1E1B18;padding:24px 32px;border-radius:8px 8px 0 0">
            <h1 style="color:#E8C878;margin:0;font-size:1.3rem;font-weight:800">COSENG Photography</h1>
          </div>
          <div style="padding:32px;background:#fff">
            <p style="margin:0 0 8px;font-weight:700;font-size:1.05rem">New contact form message</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px 0;border-bottom:1px solid #ede0cc;color:#666;width:30%">From</td><td style="padding:8px 0;border-bottom:1px solid #ede0cc;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #ede0cc;color:#666">Email</td><td style="padding:8px 0;border-bottom:1px solid #ede0cc"><a href="mailto:${email}" style="color:#C4A040">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666">Subject</td><td style="padding:8px 0">${subject || "—"}</td></tr>
            </table>
            <div style="background:#f9f7f3;border-left:3px solid #E8C878;padding:16px 20px;border-radius:0 6px 6px 0;margin-top:8px">
              <p style="margin:0;white-space:pre-wrap;line-height:1.7">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#f9f7f3;border-top:1px solid #ede0cc;border-radius:0 0 8px 8px">
            <p style="margin:0;font-size:0.78rem;color:#999">Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
