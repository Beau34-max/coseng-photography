"use client";
import { useState } from "react";
import { FiCheck, FiClock, FiCamera } from "react-icons/fi";
import styles from "./book.module.css";

export default function BookingClient({ packages }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", sessionDate: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const pkg = packages.find((p) => p.id === selected);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, packageName: pkg.name, packageId: pkg.id, amount: pkg.price }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Booking failed"); setSubmitting(false); return; }
      setDone(true);
    } catch { setError("Something went wrong. Please try again."); setSubmitting(false); }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <div className={styles.successIcon}><FiCheck size={32} /></div>
          <h2>Booking Confirmed!</h2>
          <p>Thank you, {form.clientName}. We&apos;ve received your booking for <strong>{pkg.name}</strong>.</p>
          <p>We&apos;ll be in touch at <strong>{form.clientEmail}</strong> to confirm your session date and details.</p>
          <a href="/" className={styles.homeBtn}>Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Book a Session</h1>
        <p>Professional photography for every occasion. Select your package and we&apos;ll be in touch to confirm.</p>
      </div>

      <div className={styles.container}>
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`}><span>1</span> Choose Package</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`}><span>2</span> Your Details</div>
        </div>

        {step === 1 && (
          <div>
            <h2 className={styles.sectionTitle}>Choose Your Package</h2>
            <div className={styles.packagesGrid}>
              {packages.map((p) => (
                <div
                  key={p.id}
                  className={`${styles.packageCard} ${selected === p.id ? styles.packageSelected : ""}`}
                  onClick={() => setSelected(p.id)}
                >
                  <div className={styles.packageHeader}>
                    <h3>{p.name}</h3>
                    <span className={styles.packagePrice}>£{p.price}</span>
                  </div>
                  <div className={styles.packageDuration}><FiClock size={14} /> {p.duration}</div>
                  <p className={styles.packageDesc}>{p.description}</p>
                  <ul className={styles.packageIncludes}>
                    {p.includes.map((item, i) => <li key={i}><FiCheck size={13} /> {item}</li>)}
                  </ul>
                  {selected === p.id && <div className={styles.selectedMark}><FiCheck size={16} /> Selected</div>}
                </div>
              ))}
            </div>
            <div className={styles.stepFooter}>
              <button
                className={styles.nextBtn}
                disabled={!selected}
                onClick={() => setStep(2)}
              >
                Continue with {pkg?.name} →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className={styles.selectedSummary}>
              <FiCamera size={18} />
              <div>
                <strong>{pkg.name}</strong>
                <span>£{pkg.price} · {pkg.duration}</span>
              </div>
              <button className={styles.changeBtn} onClick={() => setStep(1)}>Change</button>
            </div>

            <h2 className={styles.sectionTitle}>Your Details</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Full Name *</label>
                  <input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} placeholder="Sarah Johnson" required />
                </div>
                <div className={styles.field}>
                  <label>Email Address *</label>
                  <input type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))} placeholder="sarah@example.com" required />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Phone Number</label>
                  <input type="tel" value={form.clientPhone} onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))} placeholder="+44 7xxx xxxxxx" />
                </div>
                <div className={styles.field}>
                  <label>Preferred Date</label>
                  <input type="date" value={form.sessionDate} onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Additional Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Tell us about your vision, location preferences, or anything we should know…" />
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? "Sending…" : "Request Booking"}
                </button>
              </div>
              <p className={styles.note}>We&apos;ll confirm your session date by email within 24 hours. No payment required at this stage.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
