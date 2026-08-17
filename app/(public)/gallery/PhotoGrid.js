"use client";
import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./gallery.module.css";

export default function PhotoGrid({ photos }) {
  const [lightbox, setLightbox] = useState(null); // index into photos

  function open(i) { setLightbox(i); }
  function close() { setLightbox(null); }
  function prev() { setLightbox((i) => (i - 1 + photos.length) % photos.length); }
  function next() { setLightbox((i) => (i + 1) % photos.length); }

  function onKey(e) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  if (photos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No photos in this category yet.</p>
      </div>
    );
  }

  const current = lightbox !== null ? photos[lightbox] : null;

  return (
    <>
      <div className={styles.masonry}>
        {photos.map((p, i) => (
          <button
            key={p._id}
            className={styles.thumb}
            onClick={() => open(i)}
            aria-label={p.caption || "View photo"}
          >
            <img src={p.url} alt={p.caption || ""} loading="lazy" />
          </button>
        ))}
      </div>

      {current && (
        <div
          className={styles.lightbox}
          onClick={close}
          onKeyDown={onKey}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <button className={styles.lbClose} onClick={close} aria-label="Close">
            <FiX size={22} />
          </button>
          <button className={`${styles.lbArrow} ${styles.lbPrev}`} onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
            <FiChevronLeft size={28} />
          </button>
          <div className={styles.lbImg} onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={current.caption || ""} />
            {current.caption && <p className={styles.lbCaption}>{current.caption}</p>}
          </div>
          <button className={`${styles.lbArrow} ${styles.lbNext}`} onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
            <FiChevronRight size={28} />
          </button>
        </div>
      )}
    </>
  );
}
