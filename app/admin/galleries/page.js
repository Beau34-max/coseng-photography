import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiImage, FiEye, FiEdit2, FiTrash2, FiShare2 } from "react-icons/fi";
import styles from "./galleries.module.css";

export const metadata = { title: "Galleries" };

async function getGalleries() {
  try {
    const db = await connectToDb();
    const galleries = await db.collection("galleries").find({}).sort({ createdAt: -1 }).toArray();
    return galleries.map((g) => ({ ...g, _id: g._id.toString() }));
  } catch { return []; }
}

const CATEGORIES = ["all", "birthday", "event", "portrait", "commercial", "charity", "wedding", "landscape", "other"];

export default async function GalleriesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const galleries = await getGalleries();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Galleries</h1>
          <p>{galleries.length} galleries total</p>
        </div>
        <Link href="/admin/galleries/new" className={styles.newBtn}>
          <FiPlus size={16} /> New Gallery
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className={styles.empty}>
          <FiImage size={48} />
          <p>No galleries yet. Create your first one.</p>
          <Link href="/admin/galleries/new" className={styles.newBtn}>Create Gallery</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {galleries.map((g) => (
            <div key={g._id} className={styles.card}>
              <div className={styles.cardCover} style={{ background: g.coverImage ? `url(${g.coverImage}) center/cover` : "#1a2332" }}>
                {!g.coverImage && <FiImage size={32} style={{ color: "rgba(255,255,255,0.3)" }} />}
                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${g.isPublic ? styles.badgeGreen : styles.badgeGrey}`}>
                    {g.isPublic ? "Public" : "Private"}
                  </span>
                  <span className={styles.badge}>{g.category}</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3>{g.title}</h3>
                <div className={styles.meta}>
                  <span><FiImage size={13} /> {g.photoCount || 0} photos</span>
                  <span><FiEye size={13} /> {g.viewCount || 0} views</span>
                  {g.clientName && <span>{g.clientName}</span>}
                </div>
                <div className={styles.actions}>
                  <Link href={`/admin/galleries/${g._id}`} className={styles.actBtn}><FiEdit2 size={14} /> Edit</Link>
                  {g.isPublic && (
                    <a href={`/gallery/${g.slug}`} target="_blank" rel="noopener noreferrer" className={styles.actBtn}>
                      <FiEye size={14} /> View
                    </a>
                  )}
                  {g.accessCode && (
                    <a href={`/client/${g.accessCode}`} target="_blank" rel="noopener noreferrer" className={styles.actBtn}>
                      <FiShare2 size={14} /> Client Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
