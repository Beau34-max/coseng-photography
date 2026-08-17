"use client";
import { useState, useRef } from "react";
import {
  FiCheck, FiUploadCloud, FiTrash2, FiImage, FiType, FiLayout, FiGripVertical,
} from "react-icons/fi";
import styles from "./homepage-editor.module.css";

const TABS = [
  { id: "hero",     label: "Hero Section",  Icon: FiLayout },
  { id: "carousel", label: "Carousel",      Icon: FiImage },
];

export default function HomepageEditor({ initial }) {
  const [tab, setTab]         = useState("hero");
  const [hero, setHero]       = useState(initial.hero);
  const [carousel, setCarousel] = useState(initial.carousel || []);
  const [saving, setSaving]   = useState(false);
  const [flash, setFlash]     = useState("");
  const [uploading, setUploading] = useState(false);
  const heroImgRef  = useRef();

  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3500);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero, carousel }),
      });
      if (res.ok) showFlash("Homepage saved — changes will appear live shortly");
      else showFlash("Save failed");
    } catch { showFlash("Save failed"); }
    setSaving(false);
  }

  // ── Cloudinary upload helper ──────────────────────────────────────────────
  async function cloudinaryUpload(file) {
    const sigRes = await fetch("/api/photos/sign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!sigRes.ok) throw new Error("Could not get upload signature");
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", apiKey);
    fd.append("timestamp", String(timestamp));
    fd.append("signature", signature);
    fd.append("folder", folder);

    const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });
    if (!up.ok) throw new Error("Upload failed");
    return up.json();
  }

  // ── Hero background upload ────────────────────────────────────────────────
  async function handleHeroBg(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await cloudinaryUpload(file);
      setHero((h) => ({ ...h, backgroundImage: result.secure_url }));
      showFlash("Hero background uploaded");
    } catch (err) { showFlash(err.message || "Upload failed"); }
    setUploading(false);
    e.target.value = "";
  }

  // ── Carousel photo upload ─────────────────────────────────────────────────
  async function handleCarouselUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = [];
      for (const file of files) {
        const r = await cloudinaryUpload(file);
        results.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: r.secure_url,
          label: "Our Work",
        });
      }
      setCarousel((c) => [...c, ...results]);
      showFlash(`${results.length} photo${results.length !== 1 ? "s" : ""} added to carousel`);
    } catch (err) { showFlash(err.message || "Upload failed"); }
    setUploading(false);
    e.target.value = "";
  }

  function removeCarouselPhoto(id) {
    setCarousel((c) => c.filter((p) => p.id !== id));
  }

  function updateLabel(id, label) {
    setCarousel((c) => c.map((p) => p.id === id ? { ...p, label } : p));
  }

  return (
    <div className={styles.page}>
      {flash && (
        <div className={styles.flash}>
          <FiCheck size={15} /> {flash}
        </div>
      )}

      <div className={styles.topBar}>
        <div>
          <h1>Homepage</h1>
          <p>Edit what visitors see when they land on your site</p>
        </div>
        <button className={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className={styles.tabs}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── HERO TAB ── */}
      {tab === "hero" && (
        <div className={styles.tabContent}>
          <div className={styles.grid}>
            {/* Left: text fields */}
            <div>
              <div className={styles.section}>
                <h3><FiType size={14} style={{ marginRight: 6 }} />Hero Text</h3>
                <p className={styles.hint}>This is the large text visitors see first on your homepage.</p>

                <div className={styles.field}>
                  <label>Main Headline</label>
                  <input
                    value={hero.title}
                    onChange={(e) => setHero((h) => ({ ...h, title: e.target.value }))}
                    placeholder="Capturing Moments"
                  />
                </div>
                <div className={styles.field}>
                  <label>Headline Accent <span className={styles.green}>(shown in green)</span></label>
                  <input
                    value={hero.titleAccent}
                    onChange={(e) => setHero((h) => ({ ...h, titleAccent: e.target.value }))}
                    placeholder="That Last Forever"
                  />
                </div>
                <div className={styles.field}>
                  <label>Subtitle</label>
                  <textarea
                    rows={3}
                    value={hero.subtitle}
                    onChange={(e) => setHero((h) => ({ ...h, subtitle: e.target.value }))}
                    placeholder="Professional photography for…"
                  />
                </div>
              </div>
            </div>

            {/* Right: background image */}
            <div>
              <div className={styles.section}>
                <h3><FiImage size={14} style={{ marginRight: 6 }} />Hero Background Photo</h3>
                <p className={styles.hint}>The full-screen photo behind your headline. Landscape photos work best.</p>

                <div className={styles.heroBgPreview} style={{
                  backgroundImage: hero.backgroundImage
                    ? `url(${hero.backgroundImage})`
                    : "linear-gradient(135deg, #0a0a0a 0%, #1a2a1a 100%)",
                }}>
                  <div className={styles.heroBgOverlay}>
                    <span className={styles.heroBgText}>
                      {hero.title}<br />
                      <em style={{ color: "#a8d48a" }}>{hero.titleAccent}</em>
                    </span>
                  </div>
                </div>

                <input
                  ref={heroImgRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleHeroBg}
                />
                <button
                  className={styles.uploadBtn}
                  onClick={() => heroImgRef.current.click()}
                  disabled={uploading}
                >
                  <FiUploadCloud size={16} />
                  {uploading ? "Uploading…" : hero.backgroundImage ? "Change Background Photo" : "Upload Background Photo"}
                </button>

                {hero.backgroundImage && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => setHero((h) => ({ ...h, backgroundImage: null }))}
                  >
                    <FiTrash2 size={13} /> Remove — use default dark background
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CAROUSEL TAB ── */}
      {tab === "carousel" && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3><FiImage size={14} style={{ marginRight: 6 }} />Carousel Photos</h3>
            <p className={styles.hint}>
              These photos rotate in the carousel on your homepage. Upload directly here — they are
              separate from your client galleries and will not appear in the public gallery.
              Add at least 3 for the best effect.
            </p>

            <label className={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleCarouselUpload}
                disabled={uploading}
              />
              <FiUploadCloud size={32} />
              <span>{uploading ? "Uploading — please wait…" : "Click to upload carousel photos"}</span>
              <span className={styles.uploadHint}>JPG, PNG, WebP — any size, multiple at once</span>
            </label>

            {carousel.length === 0 ? (
              <div className={styles.empty}>
                <FiImage size={32} />
                <p>No carousel photos yet — upload some above.</p>
                <p className={styles.emptyHint}>Until you add photos here, the carousel will use photos pinned from your galleries.</p>
              </div>
            ) : (
              <div className={styles.carouselGrid}>
                {carousel.map((photo) => (
                  <div key={photo.id} className={styles.carouselCard}>
                    <div className={styles.carouselThumb}>
                      <img src={photo.url} alt={photo.label} />
                    </div>
                    <div className={styles.carouselMeta}>
                      <input
                        className={styles.labelInput}
                        value={photo.label}
                        onChange={(e) => updateLabel(photo.id, e.target.value)}
                        placeholder="Caption label"
                      />
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeCarouselPhoto(photo.id)}
                        title="Remove from carousel"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
