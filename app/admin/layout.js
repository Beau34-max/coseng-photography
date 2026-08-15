import AdminSidebar from "./components/adminSidebar/AdminSidebar";
import styles from "./admin.module.css";

export const metadata = { title: { default: "Admin", template: "%s | Photo Admin" } };

export default function AdminLayout({ children }) {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
