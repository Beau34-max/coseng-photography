import { connectToDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./bookings.module.css";

export const metadata = { title: "Bookings" };

async function getBookings() {
  try {
    const db = await connectToDb();
    const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
    return bookings.map((b) => ({ ...b, _id: b._id.toString() }));
  } catch { return []; }
}

const STATUS_LABELS = { confirmed: "Confirmed", pending: "Pending", completed: "Completed", cancelled: "Cancelled" };
const PAYMENT_LABELS = { paid: "Paid", pending: "Pending" };

export default async function BookingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const bookings = await getBookings();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Bookings</h1>
          <p>{bookings.length} bookings total</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.empty}><p>No bookings yet. They&apos;ll appear here when clients book sessions.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th><th>Package</th><th>Session Date</th>
                <th>Amount</th><th>Payment</th><th>Status</th><th>Booked</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div className={styles.clientName}>{b.clientName}</div>
                    <div className={styles.clientEmail}>{b.clientEmail}</div>
                  </td>
                  <td>{b.packageName}</td>
                  <td>{b.sessionDate ? new Date(b.sessionDate).toLocaleDateString("en-GB") : "TBC"}</td>
                  <td>{b.amount ? `£${b.amount.toLocaleString()}` : "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${b.paymentStatus === "paid" ? styles.badgeGreen : styles.badgeAmber}`}>
                      {PAYMENT_LABELS[b.paymentStatus] || b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${b.status === "confirmed" ? styles.badgeBlue : b.status === "completed" ? styles.badgeGreen : styles.badgeGrey}`}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
