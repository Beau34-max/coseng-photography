"use client";
import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiCheck } from "react-icons/fi";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setDone(true); } else { setError("Message failed to send. Please try again."); }
    } catch { setError("Something went wrong. Please try again."); }
    setSubmitting(false);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Get in Touch</h1>
        <p>We&apos;d love to hear about your project. Reach out and we&apos;ll respond within 24 hours.</p>
      </section>

      <section className={styles.body}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.infoCol}>
              <h2>Contact Information</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}><FiMail size={20} /><div><strong>Email</strong><span>photography@coseng.co.uk</span></div></div>
                <div className={styles.infoItem}><FiPhone size={20} /><div><strong>Phone</strong><span>+44 20 0000 0000</span></div></div>
                <div className={styles.infoItem}><FiMapPin size={20} /><div><strong>Location</strong><span>London, United Kingdom</span></div></div>
              </div>
              <div className={styles.social}>
                <a href="#" className={styles.socialLink}><FiInstagram size={20} /></a>
                <a href="#" className={styles.socialLink}><FiFacebook size={20} /></a>
              </div>
            </div>

            <div className={styles.formCol}>
              {done ? (
                <div className={styles.success}>
                  <div className={styles.successIcon}><FiCheck size={28} /></div>
                  <h3>Message Sent!</h3>
                  <p>Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  {error && <div className={styles.error}>{error}</div>}
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Name *</label>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
                    </div>
                    <div className={styles.field}>
                      <label>Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Subject</label>
                    <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" />
                  </div>
                  <div className={styles.field}>
                    <label>Message *</label>
                    <textarea rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tell us about your project…" required />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
