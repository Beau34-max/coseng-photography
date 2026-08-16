"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCamera, FiArrowRight } from "react-icons/fi";
import styles from "./client.module.css";

export default function ClientLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setError("");
    const r = await fetch(`/api/client-gallery/${code.trim().toUpperCase()}`);
    setLoading(false);
    if (r.ok) {
      router.push(`/client/${code.trim().toUpperCase()}`);
    } else {
      setError("Gallery not found. Please check your access code and try again.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <FiCamera size={28} />
        </div>
        <h1>Access Your Gallery</h1>
        <p>Enter the access code from your gallery notification email.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. ABC-12345"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            autoComplete="off"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading || !code.trim()}>
            {loading ? "Checking…" : <>View My Gallery <FiArrowRight size={16} /></>}
          </button>
        </form>
        <p className={styles.help}>
          Don&apos;t have an access code? <a href="mailto:photography@coseng.co.uk">Contact us</a>
        </p>
        <a href="/" className={styles.homeLink}>← Back to Home</a>
      </div>
    </div>
  );
}
