"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./galleries.module.css";

export default function MigrateBanner() {
  const router = useRouter();
  const [state, setState] = useState("idle"); // idle | running | done | error
  const [result, setResult] = useState(null);

  async function handleMigrate() {
    setState("running");
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Migration failed");
      setResult(data);
      setState("done");
      router.refresh();
    } catch (err) {
      setResult({ error: err.message });
      setState("error");
    }
  }

  if (state === "done" && result) {
    return (
      <div className={styles.migrateBar} style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
        <p style={{ color: "#166534" }}>
          Migration complete — {result.migrated} migrated, {result.skipped} already public
          {result.failed > 0 ? `, ${result.failed} failed` : ""}.
          Reload the page to see your photos.
        </p>
        <button onClick={() => window.location.reload()} className={styles.migrateBtn} style={{ background: "#16a34a" }}>
          Reload
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={styles.migrateBar} style={{ borderColor: "#fca5a5", background: "#fef2f2" }}>
        <p style={{ color: "#991b1b" }}>Migration failed: {result?.error}. Try again.</p>
        <button onClick={() => setState("idle")} className={styles.migrateBtn} style={{ background: "#dc2626" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.migrateBar}>
      <p>
        <strong>Photos not showing?</strong> Your existing photos are stored as private assets.
        Click to re-upload them as public — this fixes the gallery and carousel instantly.
      </p>
      <button onClick={handleMigrate} disabled={state === "running"} className={styles.migrateBtn}>
        {state === "running" ? "Migrating… please wait" : "Fix Photos Now"}
      </button>
    </div>
  );
}
