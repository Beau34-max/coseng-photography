import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "COSENG Photography <noreply@coseng.co.uk>";
const ADMIN = "photography@coseng.co.uk";

function header() {
  return `<div style="background:#1E1B18;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="color:#E8C878;margin:0;font-size:1.3rem;font-weight:800;letter-spacing:0.03em">COSENG Photography</h1>
  </div>`;
}

function footer() {
  return `<div style="padding:20px 32px;background:#f9f7f3;border-top:1px solid #ede0cc;border-radius:0 0 8px 8px">
    <p style="margin:0;font-size:0.78rem;color:#999">© ${new Date().getFullYear()} COSENG Photography · Newcastle &amp; the North East</p>
  </div>`;
}

async function send(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — email not sent");
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendGalleryReadyEmail({ to, clientName, galleryTitle, accessCode, accessUrl }) {
  await send(to, `Your gallery is ready — ${galleryTitle}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${header()}
      <div style="padding:32px;background:#fff">
        <p style="margin:0 0 12px">Hi <strong>${clientName}</strong>,</p>
        <p style="margin:0 0 24px">Your gallery <strong>${galleryTitle}</strong> is ready to view and download.</p>
        <p style="margin:0 0 24px">
          <a href="${accessUrl}" style="background:#E8C878;color:#1a1a1a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">
            View My Gallery →
          </a>
        </p>
        <p style="color:#555;font-size:0.9rem">Access code: <strong style="letter-spacing:0.1em;background:#f4f0e8;padding:2px 8px;border-radius:4px">${accessCode}</strong></p>
        <p style="color:#888;font-size:0.82rem;margin-top:24px">This link will stay active. Reply to this email with any questions.</p>
      </div>
      ${footer()}
    </div>
  `);
}

export async function sendBookingConfirmationEmail(to, { clientName, packageName, sessionDate, amount }) {
  const dateStr = sessionDate ? new Date(sessionDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "To be confirmed";
  await send(to, "Booking Confirmed — COSENG Photography", `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${header()}
      <div style="padding:32px;background:#fff">
        <p style="margin:0 0 8px">Hi <strong>${clientName}</strong>,</p>
        <p style="margin:0 0 24px;color:#555">Your booking is confirmed. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666;width:40%">Package</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc;font-weight:600">${packageName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc;font-weight:600">${dateStr}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount</td><td style="padding:10px 0;font-weight:600">£${amount}</td></tr>
        </table>
        <p style="color:#888;font-size:0.82rem">We will be in touch closer to the date with further details. Reply to this email with any questions.</p>
      </div>
      ${footer()}
    </div>
  `);
}

export async function sendBookingNotificationEmail({ clientName, clientEmail, packageName, sessionDate, amount }) {
  const dateStr = sessionDate ? new Date(sessionDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBC";
  await send(ADMIN, `New Booking: ${packageName} — ${clientName}`, `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${header()}
      <div style="padding:32px;background:#fff">
        <p style="margin:0 0 16px;font-weight:700;font-size:1.05rem">New booking received</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666;width:40%">Client</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc;font-weight:600">${clientName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666">Email</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc"><a href="mailto:${clientEmail}" style="color:#C4A040">${clientEmail}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666">Package</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc;font-weight:600">${packageName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #ede0cc;color:#666">Date</td><td style="padding:10px 0;border-bottom:1px solid #ede0cc;font-weight:600">${dateStr}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Amount</td><td style="padding:10px 0;font-weight:600">£${amount}</td></tr>
        </table>
      </div>
      ${footer()}
    </div>
  `);
}
