import Link from "next/link";
import { connectToDb } from "@/lib/mongodb";
import PhotoGrid from "./PhotoGrid";
import styles from "./gallery.module.css";

export const metadata = { title: "Gallery" };
export const revalidate = 60;

const CATEGORIES = ["All", "Birthday", "Event", "Portrait", "Commercial", "Charity", "Wedding", "Landscape", "Other"];

async function getAllPhotos() {
  try {
    const db = await connectToDb();
    const galleries = await db.collection("galleries")
      .find({ isPublic: true })
      .project({ _id: 1, category: 1 })
      .toArray();

    if (!galleries.length) return [];

    const catMap = {};
    galleries.forEach((g) => {
      const raw = g.category || "other";
      // Normalise to title-case so lowercase DB values match the filter buttons
      catMap[g._id.toString()] = raw.charAt(0).toUpperCase() + raw.slice(1);
    });
    const galleryIds = galleries.map((g) => g._id.toString());

    const photos = await db.collection("photos")
      .find({ galleryId: { $in: galleryIds } })
      .sort({ uploadedAt: -1 })
      .toArray();

    return photos.map((p) => ({
      _id: p._id.toString(),
      url: p.url,
      caption: p.caption || "",
      category: catMap[p.galleryId] || "Other",
    }));
  } catch { return []; }
}

export default async function GalleryPage({ searchParams }) {
  const photos = await getAllPhotos();
  const cat = searchParams?.cat || "All";
  const filtered = cat === "All" ? photos : photos.filter((p) => p.category === cat);

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

        <PhotoGrid photos={filtered} />
      </div>
    </div>
  );
}
