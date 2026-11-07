"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import styles from "./galleries.module.css";

export default function GalleryActions({ galleryId, galleryTitle }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/galleries/${galleryId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className={styles.confirmDelete}>
        <span>Delete &ldquo;{galleryTitle}&rdquo;?</span>
        <button onClick={handleDelete} disabled={deleting} className={styles.confirmBtn}>
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button onClick={() => setConfirm(false)} className={styles.cancelBtn}>Cancel</button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)} className={`${styles.actBtn} ${styles.actBtnDanger}`} title="Delete gallery">
      <FiTrash2 size={14} /> Delete
    </button>
  );
}
