import Link from "next/link";
import { connectToDb } from "@/lib/mongodb";
import { FiImage } from "react-icons/fi";
import styles from "./gallery.module.css";

export const metadata = { title: "Gallery" };
export const revalidate = 60;

const CATEGORIES = ["All", "Birthday", "Event", "Portrait", "Commercial", "Charity", "Wedding", "Landscape", "Other"];

async function getGalleries() {
  try {
    const db = await connectToDb();
    return db.collection("galleries")
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .toArray()
      .then((gs) => gs.map((g) => ({ ...g, _id: g._id.toString() })));
  } catch { return []; }
}

export default async function GalleryPage({ searchParams }) {
  const galleries = await getGalleries();
  const cat = searchParams?.cat || "All";
  const filtered = cat === "All" ? galleries : galleries.filter((g) => g.category === cat);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1>Gallery</h1>
          <p>Browse our photography work across all categories.</p>
        </div>
      </div>

      <div className={styles.sectionInner}>
        <div className={styles.filters}>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={c === "All" ? "/gallery" : `/gallery?cat=${c}`}
              className={`${styles.filterBtn} ${cat === c ? styles.filterActive : ""}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <FiImage size={48} />
            <p>No galleries in this category yet.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((g) => (
              <Link href={`/gallery/${g.slug}`} key={g._id} className={styles.card}>
                <div className={styles.cardImg} style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
                  {g.coverUrl && <img src={g.coverUrl} alt={g.title} loading="lazy" />}
                  <span className={styles.count}><FiImage size={12} /> {g.photoCount || 0}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>{g.title}</h3>
                  <span className={styles.category}>{g.category}</span>
                  {g.description && <p>{g.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
