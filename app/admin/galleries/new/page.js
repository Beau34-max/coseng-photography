"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import styles from "./new-gallery.module.css";

const CATEGORIES = ["birthday", "event", "portrait", "commercial", "charity", "wedding", "landscape", "other"];

function generateCode(len = 10) {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

export default function NewGalleryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", slug: "", category: "portrait", description: "",
    clientName: "", clientEmail: "", accessCode: "", isPublic: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleTitle(e) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugify(title) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.slug.trim()) { setError("Title and slug are required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create gallery"); setLoading(false); return; }
      router.push(`/admin/galleries/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>New Gallery</h1>
        <p>Set up your gallery details and start uploading photos.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2>Gallery Details</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Gallery Title *</label>
              <input value={form.title} onChange={handleTitle} placeholder="e.g. Sarah & James Wedding" required />
            </div>
            <div className={styles.field}>
              <label>URL Slug *</label>
              <div className={styles.slugWrap}>
                <span>/gallery/</span>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="sarah-james-wedding" required />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Visibility</label>
              <label className={styles.toggle}>
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
                <span>Show on public gallery page</span>
              </label>
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description for this gallery…" />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Client Delivery</h2>
          <p className={styles.hint}>Fill this in to generate a private client gallery link.</p>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Client Name</label>
              <input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Sarah Johnson" />
            </div>
            <div className={styles.field}>
              <label>Client Email</label>
              <input type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))} placeholder="sarah@example.com" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Access Code</label>
            <div className={styles.codeWrap}>
              <input value={form.accessCode} onChange={(e) => setForm((f) => ({ ...f, accessCode: e.target.value }))} placeholder="Leave blank to disable client access" />
              <button type="button" className={styles.genBtn} onClick={() => setForm((f) => ({ ...f, accessCode: generateCode() }))}>
                <FiRefreshCw size={15} /> Generate
              </button>
            </div>
            {form.accessCode && (
              <p className={styles.preview}>Client link: <code>/client/{form.accessCode}</code></p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating…" : "Create Gallery"}
          </button>
        </div>
      </form>
    </div>
  );
}
