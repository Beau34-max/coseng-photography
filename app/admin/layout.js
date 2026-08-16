import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "./components/adminSidebar/AdminSidebar";
import styles from "./admin.module.css";

export const metadata = { title: { default: "Admin", template: "%s | Photo Admin" } };

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();
  if (!admin) return <>{children}</>;
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
