"use client";
import { useState } from "react";
import { FiCamera, FiLock, FiArrowRight } from "react-icons/fi";
import styles from "./client-gallery.module.css";

export default function PinGate({ code, galleryTitle }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/client-gallery/${code}/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        setError(data.error || "Incorrect PIN");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.pinPage}>
      <div className={styles.pinCard}>
        <div className={styles.pinLogoBar}>
          <FiCamera size={18} />
          <span>COSENG Photography</span>
        </div>
        <div className={styles.pinIconWrap}>
          <FiLock size={28} />
        </div>
        <h1 className={styles.pinTitle}>{galleryTitle}</h1>
        <p className={styles.pinSubtitle}>Enter the PIN your photographer provided to access your gallery.</p>
        <form onSubmit={handleSubmit} className={styles.pinForm}>
          <input
            type="text"
            inputMode="numeric"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            placeholder="Enter PIN"
            className={`${styles.pinInput} ${error ? styles.pinInputError : ""}`}
            autoFocus
            autoComplete="off"
          />
          {error && <p className={styles.pinError}>{error}</p>}
          <button type="submit" className={styles.pinBtn} disabled={loading || !pin.trim()}>
            {loading ? "Checking…" : "View My Gallery"}
            {!loading && <FiArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
