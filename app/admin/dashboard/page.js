import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FiImage, FiCalendar, FiUsers, FiEye, FiDownload, FiPlus } from "react-icons/fi";
import Link from "next/link";
import styles from "./dashboard.module.css";

export const metadata = { title: "Dashboard" };

async function getStats() {
  try {
    const db = await connectToDb();
    const [galleries, photos, bookings, clients] = await Promise.all([
      db.collection("galleries").countDocuments(),
      db.collection("photos").countDocuments(),
      db.collection("bookings").countDocuments(),
      db.collection("clients").countDocuments(),
    ]);
    const recentBookings = await db.collection("bookings")
      .find({}).sort({ createdAt: -1 }).limit(5).toArray();
    const recentGalleries = await db.collection("galleries")
      .find({}).sort({ createdAt: -1 }).limit(5).toArray();
    const revenue = await db.collection("bookings")
      .aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).toArray();
    return {
      galleries, photos, bookings, clients,
      revenue: revenue[0]?.total || 0,
      recentBookings: recentBookings.map((b) => ({ ...b, _id: b._id.toString() })),
      recentGalleries: recentGalleries.map((g) => ({ ...g, _id: g._id.toString() })),
    };
  } catch { return { galleries: 0, photos: 0, bookings: 0, clients: 0, revenue: 0, recentBookings: [], recentGalleries: [] }; }
}

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const stats = await getStats();

  const statCards = [
    { Icon: FiImage, label: "Galleries", value: stats.galleries, href: "/admin/galleries", color: "#6d28d9" },
    { Icon: FiImage, label: "Photos", value: stats.photos.toLocaleString(), color: "#0891b2" },
    { Icon: FiCalendar, label: "Bookings", value: stats.bookings, href: "/admin/bookings", color: "#c2185b" },
    { Icon: FiUsers, label: "Clients", value: stats.clients, href: "/admin/clients", color: "#059669" },
    { Icon: FiDownload, label: "Revenue", value: `£${stats.revenue.toLocaleString()}`, color: "#d97706" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {admin.name || admin.email}</p>
        </div>
        <Link href="/admin/galleries/new" className={styles.newBtn}>
          <FiPlus size={16} /> New Gallery
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map(({ Icon, label, value, href, color }) => (
          <div key={label} className={styles.statCard} style={{ borderTopColor: color }}>
            <div className={styles.statIcon} style={{ background: `${color}18`, color }}><Icon size={20} /></div>
            <div>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue}>{value}</p>
            </div>
            {href && <Link href={href} className={styles.statLink}>View →</Link>}
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.recentBox}>
          <div className={styles.boxHeader}><h3>Recent Bookings</h3><Link href="/admin/bookings">View all</Link></div>
          {stats.recentBookings.length === 0 ? (
            <p className={styles.empty}>No bookings yet.</p>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Client</th><th>Package</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.clientName}</td>
                    <td>{b.packageName}</td>
                    <td>{b.sessionDate ? new Date(b.sessionDate).toLocaleDateString("en-GB") : "TBC"}</td>
                    <td><span className={`${styles.badge} ${b.paymentStatus === "paid" ? styles.badgeGreen : styles.badgeAmber}`}>{b.paymentStatus || "pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.recentBox}>
          <div className={styles.boxHeader}><h3>Recent Galleries</h3><Link href="/admin/galleries">View all</Link></div>
          {stats.recentGalleries.length === 0 ? (
            <p className={styles.empty}>No galleries yet.</p>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Title</th><th>Photos</th><th>Views</th><th>Visibility</th></tr></thead>
              <tbody>
                {stats.recentGalleries.map((g) => (
                  <tr key={g._id}>
                    <td><Link href={`/admin/galleries/${g._id}`}>{g.title}</Link></td>
                    <td>{g.photoCount || 0}</td>
                    <td>{g.viewCount || 0}</td>
                    <td><span className={`${styles.badge} ${g.isPublic ? styles.badgeGreen : styles.badgeGrey}`}>{g.isPublic ? "Public" : "Private"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
