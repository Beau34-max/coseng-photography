import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

const FROM = "COSENG Photography <noreply@coseng.co.uk>";

export async function sendGalleryReadyEmail({ to, clientName, galleryTitle, accessCode, accessUrl }) {
  await createTransporter().sendMail({
    from: FROM,
    to,
    subject: `Your gallery is ready — ${galleryTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#0d2a4e;padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:1.4rem">COSENG Photography</h1>
        </div>
        <div style="padding:32px">
          <p>Hi <strong>${clientName}</strong>,</p>
          <p>Your gallery <strong>${galleryTitle}</strong> is now ready to view and download.</p>
          <p style="margin:24px 0">
            <a href="${accessUrl}" style="background:#6a994e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
              View My Gallery
            </a>
          </p>
          <p>Access code: <strong style="letter-spacing:0.1em">${accessCode}</strong></p>
          <p style="color:#666;font-size:0.85rem">This gallery link will remain active. If you have any questions, reply to this email.</p>
        </div>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail({ to, clientName, packageName, date, time, location, amount }) {
  await createTransporter().sendMail({
    from: FROM,
    to,
    subject: "Booking Confirmed — COSENG Photography",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#0d2a4e;padding:24px 32px">
          <h1 style="color:#fff;margin:0;font-size:1.4rem">COSENG Photography</h1>
        </div>
        <div style="padding:32px">
          <p>Hi <strong>${clientName}</strong>, your booking is confirmed!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Package</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${packageName}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${date}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Time</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${time}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">${location || "TBC"}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Amount Paid</td><td style="padding:8px 0;font-weight:600">£${amount}</td></tr>
          </table>
          <p style="color:#666;font-size:0.85rem">We will be in touch closer to the date with further details. Reply to this email with any questions.</p>
        </div>
      </div>
    `,
  });
}

export async function sendBookingNotificationEmail({ clientName, clientEmail, packageName, date, time }) {
  await createTransporter().sendMail({
    from: FROM,
    to: "photography@coseng.co.uk",
    subject: `New Booking: ${packageName} — ${clientName}`,
    html: `<p>New booking received:</p>
    <ul>
      <li><strong>Client:</strong> ${clientName} (${clientEmail})</li>
      <li><strong>Package:</strong> ${packageName}</li>
      <li><strong>Date:</strong> ${date} at ${time}</li>
    </ul>`,
  });
}
