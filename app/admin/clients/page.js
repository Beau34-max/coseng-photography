import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./clients.module.css";

export const metadata = { title: "Clients" };

async function getClients() {
  try {
    const db = await connectToDb();
    const clients = await db.collection("clients").find({}).sort({ name: 1 }).toArray();
    const bookings = await db.collection("bookings").find({}).toArray();
    const bookingsByEmail = {};
    bookings.forEach((b) => {
      if (b.clientEmail) {
        bookingsByEmail[b.clientEmail] = (bookingsByEmail[b.clientEmail] || 0) + 1;
      }
    });
    return clients.map((c) => ({
      ...c, _id: c._id.toString(),
      bookingCount: bookingsByEmail[c.email] || c.bookingCount || 0,
    }));
  } catch { return []; }
}

export default async function ClientsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const clients = await getClients();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Clients</h1>
          <p>{clients.length} clients in CRM</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className={styles.empty}><p>No clients yet. They&apos;ll be added automatically when bookings are made.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Joined</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id}>
                  <td className={styles.clientName}>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || "—"}</td>
                  <td><span className={styles.count}>{c.bookingCount}</span></td>
                  <td>{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className={styles.notes}>{c.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
