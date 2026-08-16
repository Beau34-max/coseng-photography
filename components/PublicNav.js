"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import styles from "./PublicNav.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/book", label: "Book a Session" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image src="/images/cosenglogo.png" alt="COSENG" width={110} height={36} style={{ objectFit: "contain" }} />
          <em>Photography</em>
        </Link>

        <ul className={`${styles.links} ${open ? styles.mobileOpen : ""}`}>
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/client" className={styles.clientBtn} onClick={() => setOpen(false)}>
              Client Login
            </Link>
          </li>
        </ul>

        <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
    </nav>
  );
}
