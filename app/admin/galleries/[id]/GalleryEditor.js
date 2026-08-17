"use client";
import { useState } from "react";
import { FiUploadCloud, FiTrash2, FiStar, FiCheck, FiHome, FiSettings, FiGrid, FiActivity, FiEye, FiLink, FiDroplet } from "react-icons/fi";
import styles from "./gallery-editor.module.css";

const TABS = [
  { id: "organize", label: "Organize", Icon: FiGrid },
  { id: "settings", label: "Settings", Icon: FiSettings },
  { id: "activity", label: "Activity", Icon: FiActivity },
];

export default function GalleryEditor({ gallery: initial, photos: initialPhotos }) {
  const [gallery, setGallery] = useState(initial);
  const [photos, setPhotos] = useState(initialPhotos);
  const [tab, setTab] = useState("organize");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function showFlash(msg) { setFlash(msg); setTimeout(() => setFlash(""), 3000); }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/galleries/${gallery._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gallery),
      });
      showFlash("Gallery saved");
    } catch { showFlash("Save failed"); }
    setSaving(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const sigRes = await fetch("/api/photos/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryId: gallery._id }),
      });
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      const cloudinaryResults = [];
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        fd.append("api_key", apiKey);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        fd.append("folder", folder);
        const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST", body: fd,
        });
        if (!up.ok) {
          const errBody = await up.text();
          console.error("Cloudinary error:", up.status, errBody);
          throw new Error(`Upload failed (${up.status})`);
        }
        cloudinaryResults.push(await up.json());
      }

      const saveRes = await fetch("/api/photos/save-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryId: gallery._id, photos: cloudinaryResults }),
      });
      const data = await saveRes.json();
      if (saveRes.ok) {
        setPhotos((p) => [...p, ...data.uploaded]);
        setGallery((g) => ({ ...g, photoCount: g.photoCount + data.uploaded.length }));
        showFlash(`${data.uploaded.length} photo${data.uploaded.length !== 1 ? "s" : ""} uploaded`);
      } else { showFlash(data.error || "Save failed"); }
    } catch (err) {
      console.error(err);
      showFlash(err.message || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(photoId) {
    try {
      await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      setPhotos((p) => p.filter((x) => x._id !== photoId));
      setGallery((g) => ({ ...g, photoCount: Math.max(0, g.photoCount - 1) }));
      showFlash("Photo deleted");
    } catch { showFlash("Delete failed"); }
    setDeleteId(null);
  }

  async function toggleHomepage(photo) {
    const next = !photo.showOnHomepage;
    setPhotos((p) => p.map((x) => x._id === photo._id ? { ...x, showOnHomepage: next } : x));
    await fetch(`/api/photos/${photo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHomepage: next }),
    });
    showFlash(next ? "Added to homepage carousel" : "Removed from homepage carousel");
  }

  async function setCover(photo) {
    await fetch(`/api/galleries/${gallery._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...gallery, coverImage: photo.url }),
    });
    setGallery((g) => ({ ...g, coverImage: photo.url }));
    showFlash("Cover image set");
  }

  return (
    <div className={styles.page}>
      {flash && <div className={styles.flash}><FiCheck size={15} /> {flash}</div>}

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          {gallery.coverImage && (
            <div className={styles.coverThumb}>
              <img src={gallery.coverImage} alt="" />
            </div>
          )}
          <div>
            <h1>{gallery.title}</h1>
            <p>{gallery.photoCount} photos · {gallery.viewCount || 0} views · {gallery.category}</p>
          </div>
        </div>
        <div className={styles.topBarRight}>
          {gallery.isPublic && (
            <a href={`/gallery/${gallery.slug || gallery._id}`} target="_blank" rel="noopener noreferrer" className={styles.previewBtn}>
              <FiEye size={14} /> Preview
            </a>
          )}
          <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* ORGANIZE TAB */}
      {tab === "organize" && (
        <div className={styles.tabContent}>
          <div className={styles.uploadZone}>
            <label className={styles.uploadLabel}>
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
              <FiUploadCloud size={36} />
              <span>{uploading ? "Uploading — please wait…" : "Click to add photos"}</span>
              <span className={styles.uploadHint}>JPG, PNG, WebP — any size, multiple at once</span>
            </label>
          </div>

          {photos.length === 0 ? (
            <div className={styles.emptyPhotos}><p>No photos yet — upload some above.</p></div>
          ) : (
            <div className={styles.photosGrid}>
              {photos.map((photo) => (
                <div key={photo._id} className={styles.photoCard}>
                  <div className={styles.photoThumb}>
                    <img src={photo.url} alt="" />
                    {gallery.coverImage === photo.url && (
                      <div className={styles.coverBadge}><FiStar size={11} /> Cover</div>
                    )}
                    {photo.showOnHomepage && (
                      <div className={styles.homepageBadge}><FiHome size={11} /> Home</div>
                    )}
                  </div>
                  <div className={styles.photoActions}>
                    <button
                      onClick={() => toggleHomepage(photo)}
                      className={`${styles.iconBtn} ${photo.showOnHomepage ? styles.homepageActive : ""}`}
                      title={photo.showOnHomepage ? "Remove from homepage" : "Add to homepage carousel"}
                    >
                      <FiHome size={13} />
                    </button>
                    {gallery.coverImage !== photo.url && (
                      <button onClick={() => setCover(photo)} className={styles.iconBtn} title="Set as gallery cover">
                        <FiStar size={13} />
                      </button>
                    )}
                    {deleteId === photo._id ? (
                      <div className={styles.confirmDelete}>
                        <button onClick={() => handleDelete(photo._id)} className={styles.confirmBtn}>Delete</button>
                        <button onClick={() => setDeleteId(null)} className={styles.cancelBtn}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(photo._id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete">
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div className={styles.tabContent}>
          <div className={styles.settingsGrid}>
            <div>
              <div className={styles.section}>
                <h3>Gallery Details</h3>
                <div className={styles.field}>
                  <label>Title</label>
                  <input value={gallery.title} onChange={(e) => setGallery((g) => ({ ...g, title: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Description</label>
                  <textarea rows={3} value={gallery.description || ""} onChange={(e) => setGallery((g) => ({ ...g, description: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={gallery.isPublic} onChange={(e) => setGallery((g) => ({ ...g, isPublic: e.target.checked }))} />
                    <span>Public gallery (visible to everyone)</span>
                  </label>
                </div>
              </div>

              <div className={styles.section}>
                <h3><FiHome size={14} style={{ marginRight: 6 }} />Homepage & Carousel</h3>
                <div className={styles.field}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={!!gallery.featured} onChange={(e) => setGallery((g) => ({ ...g, featured: e.target.checked }))} />
                    <span>Feature this gallery on the homepage</span>
                  </label>
                  <p className={styles.sectionHint}>
                    When enabled, this gallery&apos;s cover photo shows in the homepage carousel.
                    To pin specific photos instead, use the <FiHome size={11} /> icon in the Organize tab.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3><FiDroplet size={14} style={{ marginRight: 6 }} />Watermark & Signature</h3>
              <p className={styles.sectionHint}>Protect your work with the COSENG Photography signature.</p>
              <div className={styles.field}>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={!!gallery.showWatermark} onChange={(e) => setGallery((g) => ({ ...g, showWatermark: e.target.checked }))} />
                  <span>Apply to public gallery photos</span>
                </label>
              </div>
              <div className={styles.field}>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={!!gallery.watermarkClient} onChange={(e) => setGallery((g) => ({ ...g, watermarkClient: e.target.checked }))} />
                  <span>Apply to client delivery photos</span>
                </label>
              </div>
              <div className={styles.field}>
                <label>Position</label>
                <select
                  className={styles.select}
                  value={gallery.watermarkPosition || "south_east"}
                  onChange={(e) => setGallery((g) => ({ ...g, watermarkPosition: e.target.value }))}
                >
                  <option value="south_east">Bottom Right</option>
                  <option value="south_west">Bottom Left</option>
                  <option value="south">Bottom Centre</option>
                  <option value="north_east">Top Right</option>
                  <option value="north_west">Top Left</option>
                </select>
              </div>
              <div className={styles.watermarkPreview}>
                <span className={styles.watermarkText}>COSENG Photography</span>
              </div>
            </div>

            <div className={styles.section}>
              <h3><FiLink size={14} style={{ marginRight: 6 }} />Client Delivery</h3>
              <p className={styles.sectionHint}>Give your client a private link to view and download their gallery.</p>
              <div className={styles.field}>
                <label>Client Name</label>
                <input value={gallery.clientName || ""} onChange={(e) => setGallery((g) => ({ ...g, clientName: e.target.value }))} placeholder="e.g. Joseph Family" />
              </div>
              <div className={styles.field}>
                <label>Client Email</label>
                <input type="email" value={gallery.clientEmail || ""} onChange={(e) => setGallery((g) => ({ ...g, clientEmail: e.target.value }))} placeholder="client@email.com" />
              </div>
              <div className={styles.field}>
                <label>Access Code</label>
                <input value={gallery.accessCode || ""} onChange={(e) => setGallery((g) => ({ ...g, accessCode: e.target.value }))} placeholder="e.g. josephfamily2024" />
              </div>
              {gallery.accessCode && (
                <div className={styles.clientLinkBox}>
                  <span>Client link:</span>
                  <a href={`/client/${gallery.accessCode}`} target="_blank" rel="noopener noreferrer">
                    photos.coseng.co.uk/client/{gallery.accessCode}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === "activity" && (
        <div className={styles.tabContent}>
          <div className={styles.activityGrid}>
            <div className={styles.statCard}><strong>{gallery.photoCount || 0}</strong><span>Photos</span></div>
            <div className={styles.statCard}><strong>{gallery.viewCount || 0}</strong><span>Gallery Views</span></div>
            <div className={styles.statCard}><strong>{photos.filter((p) => p.showOnHomepage).length}</strong><span>On Homepage</span></div>
            <div className={styles.statCard}>
              <strong>{gallery.isPublic ? "Public" : "Private"}</strong>
              <span>Visibility</span>
            </div>
          </div>
          <div className={styles.section} style={{ marginTop: "1.5rem" }}>
            <h3>Gallery Info</h3>
            <div className={styles.infoRow}><span>Category</span><strong>{gallery.category || "—"}</strong></div>
            <div className={styles.infoRow}><span>Client</span><strong>{gallery.clientName || "—"}</strong></div>
            <div className={styles.infoRow}><span>Access Code</span><strong>{gallery.accessCode || "None set"}</strong></div>
            <div className={styles.infoRow}><span>Featured</span><strong>{gallery.featured ? "Yes — on homepage" : "No"}</strong></div>
            {gallery.clientEmail && (
              <div className={styles.infoRow}><span>Client Email</span><strong>{gallery.clientEmail}</strong></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
