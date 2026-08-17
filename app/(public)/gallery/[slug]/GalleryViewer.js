"use client";
import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { addPublicWatermark } from "@/lib/photo-utils";
import styles from "./gallery-viewer.module.css";

const noSave = (e) => e.preventDefault();

export default function GalleryViewer({ gallery, photos }) {
  const [lightbox, setLightbox] = useState(null);

  // Always watermark public gallery photos — strong diagonal centre mark
  const wm = (url) => addPublicWatermark(url);

  function prev() { setLightbox((i) => (i > 0 ? i - 1 : photos.length - 1)); }
  function next() { setLightbox((i) => (i < photos.length - 1 ? i + 1 : 0)); }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.category}>{gallery.category}</span>
          <h1>{gallery.title}</h1>
          {gallery.description && <p>{gallery.description}</p>}
          <span className={styles.count}><FiImage size={14} /> {photos.length} photos</span>
        </div>
      </div>

      <div className={styles.sectionInner}>
        {photos.length === 0 ? (
          <div className={styles.empty}><p>No photos in this gallery yet.</p></div>
        ) : (
          <div className={styles.grid}>
            {photos.map((p, i) => (
              <button key={p._id} className={styles.thumb} onClick={() => setLightbox(i)} onContextMenu={noSave}>
                <img
                  src={wm(p.thumbnailUrl || p.url)}
                  alt={p.caption || `Photo ${i + 1}`}
                  loading="lazy"
                  draggable={false}
                  onContextMenu={noSave}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lbClose} onClick={() => setLightbox(null)}><FiX size={24} /></button>
          <button className={styles.lbPrev} onClick={(e) => { e.stopPropagation(); prev(); }}><FiChevronLeft size={32} /></button>
          <div className={styles.lbImgWrap} onClick={(e) => e.stopPropagation()} onContextMenu={noSave}>
            <img
              src={wm(photos[lightbox].url)}
              alt={photos[lightbox].caption || ""}
              className={styles.lbImg}
              draggable={false}
              onContextMenu={noSave}
            />
            {photos[lightbox].caption && <p className={styles.lbCaption}>{photos[lightbox].caption}</p>}
            <p className={styles.lbCounter}>{lightbox + 1} / {photos.length}</p>
          </div>
          <button className={styles.lbNext} onClick={(e) => { e.stopPropagation(); next(); }}><FiChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}
