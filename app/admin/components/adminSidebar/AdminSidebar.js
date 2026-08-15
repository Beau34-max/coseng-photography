"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiImage, FiCalendar, FiUsers, FiSettings, FiLogOut, FiCamera, FiBarChart2, FiFileText } from "react-icons/fi";
import styles from "./AdminSidebar.module.css";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: FiGrid },
  { href: "/admin/galleries", label: "Galleries", Icon: FiImage },
  { href: "/admin/bookings", label: "Bookings", Icon: FiCalendar },
  { href: "/admin/clients", label: "Clients", Icon: FiUsers },
  { href: "/admin/blog", label: "Blog", Icon: FiFileText },
  { href: "/admin/settings", label: "Settings", Icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <FiCamera size={20} />
        <span>Photo<em>Admin</em></span>
      </div>

      <nav className={styles.nav}>
        {nav.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${pathname.startsWith(href) ? styles.navActive : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
          <FiBarChart2 size={16} /> View Public Site
        </a>
        <button onClick={logout} className={styles.logout}>
          <FiLogOut size={16} /> Log Out
        </button>
      </div>
    </aside>
  );
}
