"use client";
import { useState } from "react";
import { FiCheck, FiPlus, FiTrash2, FiUserPlus } from "react-icons/fi";
import styles from "./settings.module.css";

export default function SettingsClient({ settings, defaultPackages }) {
  const [packages, setPackages] = useState(settings.packages || defaultPackages);
  const [flash, setFlash] = useState("");
  const [saving, setSaving] = useState(false);

  // Add admin form state
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminFlash, setAdminFlash] = useState("");

  function showFlash(msg) { setFlash(msg); setTimeout(() => setFlash(""), 3000); }
  function showAdminFlash(msg) { setAdminFlash(msg); setTimeout(() => setAdminFlash(""), 4000); }

  function updatePkg(idx, field, value) {
    setPackages((p) => p.map((pkg, i) => i === idx ? { ...pkg, [field]: value } : pkg));
  }

  function updateIncludes(idx, raw) {
    const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setPackages((p) => p.map((pkg, i) => i === idx ? { ...pkg, includes: arr } : pkg));
  }

  function addPackage() {
    const id = `pkg_${Date.now()}`;
    setPackages((p) => [...p, { id, name: "New Package", duration: "1 hour", price: 0, description: "", includes: [] }]);
  }

  function removePkg(idx) {
    setPackages((p) => p.filter((_, i) => i !== idx));
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

  async function createAdmin(e) {
    e.preventDefault();
    setAdminSaving(true);
    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (res.ok) {
        showAdminFlash(`Admin account created for ${adminForm.email}`);
        setAdminForm({ name: "", email: "", password: "", role: "staff" });
      } else {
        showAdminFlash(data.error || "Failed to create admin");
      }
    } catch { showAdminFlash("Failed to create admin"); }
    setAdminSaving(false);
  }

  return (
    <div className={styles.page}>
      {flash && <div className={styles.flash}><FiCheck size={15} /> {flash}</div>}

      <div className={styles.topBar}>
        <div><h1>Settings</h1><p>Manage your packages, pricing and team</p></div>
        <button onClick={save} className={styles.saveBtn} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>

      {/* Packages */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>Packages & Pricing</h2>
            <p className={styles.hint}>These packages appear on the public booking page.</p>
          </div>
          <button className={styles.addBtn} onClick={addPackage}><FiPlus size={15} /> Add Package</button>
        </div>
        <div className={styles.packageGrid}>
          {packages.map((pkg, i) => (
            <div key={pkg.id} className={styles.packageCard}>
              <div className={styles.pkgCardHead}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label>Package Name</label>
                  <input value={pkg.name} onChange={(e) => updatePkg(i, "name", e.target.value)} />
                </div>
                <button className={styles.removeBtn} onClick={() => removePkg(i)} title="Remove package">
                  <FiTrash2 size={14} />
                </button>
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
              <div className={styles.field}>
                <label>Includes (comma-separated)</label>
                <input
                  value={(pkg.includes || []).join(", ")}
                  onChange={(e) => updateIncludes(i, e.target.value)}
                  placeholder="e.g. 1 hour shoot, 20 edited photos, Online gallery"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Admin */}
      <div className={styles.section}>
        <h2><FiUserPlus size={16} style={{ marginRight: 6 }} />Add Admin / Staff</h2>
        <p className={styles.hint}>Create a new login for a team member.</p>
        {adminFlash && (
          <div className={`${styles.adminFlash} ${adminFlash.includes("created") ? styles.adminFlashOk : styles.adminFlashErr}`}>
            {adminFlash}
          </div>
        )}
        <form onSubmit={createAdmin} className={styles.adminForm}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                required value={adminForm.name}
                onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
              />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input
                required type="email" value={adminForm.email}
                onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@coseng.co.uk"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Temporary Password</label>
              <input
                required type="password" value={adminForm.password}
                onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
                minLength={8}
              />
            </div>
            <div className={styles.field}>
              <label>Role</label>
              <select
                value={adminForm.role}
                onChange={(e) => setAdminForm((f) => ({ ...f, role: e.target.value }))}
                className={styles.select}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className={styles.saveBtn} disabled={adminSaving} style={{ marginTop: "0.5rem" }}>
            {adminSaving ? "Creating…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
