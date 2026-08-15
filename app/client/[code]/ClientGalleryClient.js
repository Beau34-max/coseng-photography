"use client";
import { useState } from "react";
import { FiDownload, FiHeart, FiX, FiChevronLeft, FiChevronRight, FiCamera } from "react-icons/fi";
import styles from "./client-gallery.module.css";

export default function ClientGalleryClient({ gallery, photos, accessCode }) {
  const [favourites, setFavourites] = useState(new Set());
  const [lightbox, setLightbox] = useState(null);
  const [savingFav, setSavingFav] = useState(new Set());
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const displayed = showFavsOnly ? photos.filter((p) => favourites.has(p._id)) : photos;

  async function toggleFav(photoId) {
    if (savingFav.has(photoId)) return;
    const isFav = favourites.has(photoId);
    setSavingFav((s) => new Set([...s, photoId]));
    setFavourites((prev) => {
      const n = new Set(prev);
      isFav ? n.delete(photoId) : n.add(photoId);
      return n;
    });
    try {
      await fetch(`/api/client-gallery/${accessCode}/favourite`, {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
    } finally {
      setSavingFav((s) => { const n = new Set(s); n.delete(photoId); return n; });
    }
  }

  function prev() { setLightbox((i) => (i > 0 ? i - 1 : displayed.length - 1)); }
  function next() { setLightbox((i) => (i < displayed.length - 1 ? i + 1 : 0)); }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoBar}>
            <FiCamera size={20} />
            <span>COSENG Photography</span>
          </div>
          <h1>{gallery.title}</h1>
          <p>{gallery.clientName ? `Hi ${gallery.clientName} — ` : ""}Your gallery is ready.</p>
          <div className={styles.headerMeta}>
            <span>{photos.length} photos</span>
            {favourites.size > 0 && <span>· {favourites.size} favourite{favourites.size !== 1 ? "s" : ""}</span>}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <div className={styles.toolbarLeft}>
            <button
              className={`${styles.toolBtn} ${showFavsOnly ? styles.toolBtnActive : ""}`}
              onClick={() => setShowFavsOnly((v) => !v)}
            >
              <FiHeart size={15} /> {showFavsOnly ? "Show All" : "Favourites"}
              {favourites.size > 0 && <span className={styles.favCount}>{favourites.size}</span>}
            </button>
          </div>
          <span className={styles.photoCount}>{displayed.length} photo{displayed.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.gridWrap}>
        {displayed.length === 0 ? (
          <div className={styles.empty}>
            <FiHeart size={40} />
            <p>No favourites yet. Click the heart on any photo to save it here.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayed.map((p, i) => (
              <div key={p._id} className={styles.thumb}>
                <img
                  src={p.thumbnailUrl || p.url}
                  alt={p.caption || `Photo ${i + 1}`}
                  loading="lazy"
                  onClick={() => setLightbox(i)}
                />
                <div className={styles.thumbOverlay}>
                  <button
                    className={`${styles.favBtn} ${favourites.has(p._id) ? styles.favBtnActive : ""}`}
                    onClick={() => toggleFav(p._id)}
                    title={favourites.has(p._id) ? "Remove favourite" : "Add to favourites"}
                  >
                    <FiHeart size={16} />
                  </button>
                  <a
                    href={p.url}
                    download
                    className={styles.dlBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download"
                  >
                    <FiDownload size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lbClose} onClick={() => setLightbox(null)}><FiX size={22} /></button>
          <button className={styles.lbPrev} onClick={(e) => { e.stopPropagation(); prev(); }}><FiChevronLeft size={28} /></button>
          <div className={styles.lbContent} onClick={(e) => e.stopPropagation()}>
            <img src={displayed[lightbox].url} alt="" className={styles.lbImg} />
            <div className={styles.lbActions}>
              <button
                className={`${styles.lbFav} ${favourites.has(displayed[lightbox]._id) ? styles.lbFavActive : ""}`}
                onClick={() => toggleFav(displayed[lightbox]._id)}
              >
                <FiHeart size={18} />
                {favourites.has(displayed[lightbox]._id) ? "Unfavourite" : "Favourite"}
              </button>
              <a href={displayed[lightbox].url} download target="_blank" rel="noopener noreferrer" className={styles.lbDl}>
                <FiDownload size={18} /> Download
              </a>
            </div>
            <p className={styles.lbCounter}>{lightbox + 1} / {displayed.length}</p>
          </div>
          <button className={styles.lbNext} onClick={(e) => { e.stopPropagation(); next(); }}><FiChevronRight size={28} /></button>
        </div>
      )}
    </div>
  );
}
