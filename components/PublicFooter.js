import Link from "next/link";
import { FiCamera, FiMail, FiInstagram, FiFacebook } from "react-icons/fi";
import styles from "./PublicFooter.module.css";

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <FiCamera size={20} />
            <span>COSENG <em>Photography</em></span>
          </div>
          <p>Professional photography across Newcastle &amp; the North East. Capturing moments that matter.</p>
          <div className={styles.socials}>
            <a href="mailto:photography@coseng.co.uk" aria-label="Email"><FiMail size={18} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook size={18} /></a>
          </div>
        </div>
        <div className={styles.col}>
          <h4>Navigation</h4>
          <Link href="/gallery">Gallery</Link>
          <Link href="/about">About</Link>
          <Link href="/book">Book a Session</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className={styles.col}>
          <h4>Client</h4>
          <Link href="/client">View My Gallery</Link>
          <Link href="/book">Book Now</Link>
        </div>
        <div className={styles.col}>
          <h4>Contact</h4>
          <a href="mailto:photography@coseng.co.uk">photography@coseng.co.uk</a>
          <a href="tel:+441916030219">+44 191 603 0219</a>
          <span>Newcastle &amp; the North East</span>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} COSENG Photography. All rights reserved.</span>
        <span>Part of <a href="https://www.coseng.co.uk">Coseng Limited</a></span>
      </div>
    </footer>
  );
}
