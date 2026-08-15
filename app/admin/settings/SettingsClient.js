"use client";
import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./settings.module.css";

export default function SettingsClient({ settings, defaultPackages }) {
  const [packages, setPackages] = useState(settings.packages || defaultPackages);
  const [flash, setFlash] = useState("");
  const [saving, setSaving] = useState(false);

  function showFlash(msg) { setFlash(msg); setTimeout(() => setFlash(""), 3000); }

  function updatePkg(idx, field, value) {
    setPackages((p) => p.map((pkg, i) => i === idx ? { ...pkg, [field]: value } : pkg));
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages }),
      });
      showFlash("Settings saved");
    } catch { showFlash("Save failed"); }
    setSaving(false);
  }

  return (
    <div className={styles.page}>
      {flash && <div className={styles.flash}><FiCheck size={15} /> {flash}</div>}

      <div className={styles.topBar}>
        <div><h1>Settings</h1><p>Manage your packages and pricing</p></div>
        <button onClick={save} className={styles.saveBtn} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>

      <div className={styles.section}>
        <h2>Packages & Pricing</h2>
        <p className={styles.hint}>These packages appear on the public booking page.</p>
        <div className={styles.packageGrid}>
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={styles.packageCard}>
              <div className={styles.field}>
                <label>Package Name</label>
                <input value={pkg.name} onChange={(e) => updatePkg(i, "name", e.target.value)} />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Price (£)</label>
                  <input type="number" value={pkg.price} onChange={(e) => updatePkg(i, "price", Number(e.target.value))} />
                </div>
                <div className={styles.field}>
                  <label>Duration</label>
                  <input value={pkg.duration} onChange={(e) => updatePkg(i, "duration", e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <input value={pkg.description} onChange={(e) => updatePkg(i, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
