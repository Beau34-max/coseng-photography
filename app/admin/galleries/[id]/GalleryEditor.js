"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { FiUploadCloud, FiTrash2, FiStar, FiCheck, FiAlertCircle } from "react-icons/fi";
import styles from "./gallery-editor.module.css";

export default function GalleryEditor({ gallery: initial, photos: initialPhotos }) {
  const [gallery, setGallery] = useState(initial);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  function showFlash(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 3000);
  }

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
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("galleryId", gallery._id);
    files.forEach((f) => formData.append("photos", f));
    try {
      const res = await fetch("/api/photos/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setPhotos((p) => [...p, ...data.uploaded]);
        setGallery((g) => ({ ...g, photoCount: g.photoCount + data.uploaded.length }));
        showFlash(`${data.uploaded.length} photo${data.uploaded.length > 1 ? "s" : ""} uploaded`);
      } else { showFlash(data.error || "Upload failed"); }
    } catch { showFlash("Upload failed"); }
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

      <div className={styles.topBar}>
        <div>
          <h1>{gallery.title}</h1>
          <p>{gallery.photoCount} photos · {gallery.viewCount} views · {gallery.category}</p>
        </div>
        <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftCol}>
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
                <span>Public gallery</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Client Delivery</h3>
            <div className={styles.field}>
              <label>Client Name</label>
              <input value={gallery.clientName || ""} onChange={(e) => setGallery((g) => ({ ...g, clientName: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Client Email</label>
              <input type="email" value={gallery.clientEmail || ""} onChange={(e) => setGallery((g) => ({ ...g, clientEmail: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Access Code</label>
              <input value={gallery.accessCode || ""} onChange={(e) => setGallery((g) => ({ ...g, accessCode: e.target.value }))} />
            </div>
            {gallery.accessCode && (
              <p className={styles.clientLink}>
                Client link: <a href={`/client/${gallery.accessCode}`} target="_blank" rel="noopener noreferrer">/client/{gallery.accessCode}</a>
              </p>
            )}
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.uploadZone}>
            <label className={styles.uploadLabel}>
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
              <FiUploadCloud size={32} />
              <span>{uploading ? `Uploading…` : "Click to upload photos"}</span>
              <span className={styles.uploadHint}>JPG, PNG, WebP — multiple allowed</span>
            </label>
          </div>

          {photos.length > 0 && (
            <div className={styles.photosGrid}>
              {photos.map((photo) => (
                <div key={photo._id} className={styles.photoCard}>
                  <div className={styles.photoThumb}>
                    <img src={photo.url} alt="" />
                    {gallery.coverImage === photo.url && (
                      <div className={styles.coverBadge}><FiStar size={11} /> Cover</div>
                    )}
                  </div>
                  <div className={styles.photoActions}>
                    {gallery.coverImage !== photo.url && (
                      <button onClick={() => setCover(photo)} className={styles.iconBtn} title="Set as cover"><FiStar size={14} /></button>
                    )}
                    {deleteId === photo._id ? (
                      <div className={styles.confirmDelete}>
                        <button onClick={() => handleDelete(photo._id)} className={styles.confirmBtn}>Yes, delete</button>
                        <button onClick={() => setDeleteId(null)} className={styles.cancelBtn}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(photo._id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete"><FiTrash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
