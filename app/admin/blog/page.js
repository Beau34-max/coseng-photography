import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FiPlus, FiEdit2, FiEye } from "react-icons/fi";
import styles from "./blog.module.css";

export const metadata = { title: "Blog" };

async function getPosts() {
  try {
    const db = await connectToDb();
    const posts = await db.collection("blog_posts").find({}).sort({ createdAt: -1 }).toArray();
    return posts.map((p) => ({ ...p, _id: p._id.toString() }));
  } catch { return []; }
}

export default async function BlogPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const posts = await getPosts();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div><h1>Blog</h1><p>{posts.length} posts</p></div>
        <Link href="/admin/blog/new" className={styles.newBtn}><FiPlus size={16} /> New Post</Link>
      </div>

      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No blog posts yet. Share your photography tips and stories.</p>
          <Link href="/admin/blog/new" className={styles.newBtn}>Create Post</Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id}>
                  <td className={styles.postTitle}>{p.title}</td>
                  <td className={styles.slug}>{p.slug}</td>
                  <td>
                    <span className={`${styles.badge} ${p.published ? styles.badgeGreen : styles.badgeGrey}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-GB") : "—"}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/blog/${p._id}`} className={styles.actBtn}><FiEdit2 size={13} /> Edit</Link>
                      {p.published && <a href={`/blog/${p.slug}`} target="_blank" className={styles.actBtn}><FiEye size={13} /> View</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
