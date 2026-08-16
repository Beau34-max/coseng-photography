import Link from "next/link";
import { connectToDb } from "@/lib/mongodb";
import { FiStar, FiCalendar, FiImage, FiUser, FiDownload } from "react-icons/fi";
import Carousel from "@/components/Carousel";
import styles from "./home.module.css";

export const revalidate = 60;

async function getFeaturedGalleries() {
  try {
    const db = await connectToDb();
    return db.collection("galleries")
      .find({ isPublic: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()
      .then((gs) => gs.map((g) => ({ ...g, _id: g._id.toString() })));
  } catch { return []; }
}

const services = [
  { Icon: FiStar, title: "Portrait Sessions", desc: "Individual and family portraits in studio or on location across the North East.", from: "£150" },
  { Icon: FiCalendar, title: "Events & Occasions", desc: "Birthdays, graduations, community events — we capture every moment.", from: "£200" },
  { Icon: FiImage, title: "Commercial", desc: "Professional shots for businesses, brands and organisations.", from: "£300" },
  { Icon: FiUser, title: "Charity & Community", desc: "Supporting charities and community groups across Newcastle. 4hrs — extra £100/hr thereafter.", from: "£400" },
];

const stats = [
  { value: "4,300+", label: "Photos Delivered" },
  { value: "30+", label: "Galleries" },
  { value: "500+", label: "Happy Clients" },
  { value: "5★", label: "Average Rating" },
];

export default async function HomePage() {
  const featured = await getFeaturedGalleries();

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>Newcastle &amp; the North East</span>
          <h1 className={styles.heroTitle}>
            Capturing Moments<br />
            <span className={styles.heroAccent}>That Last Forever</span>
          </h1>
          <p className={styles.heroSub}>
            Professional photography for portraits, events, commercial and community work.
            Delivering stunning images across Newcastle and the North East.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/book" className={styles.heroBtnPrimary}>
              <FiCalendar size={16} /> Book a Session
            </Link>
            <Link href="/gallery" className={styles.heroBtnOutline}>
              <FiImage size={16} /> View Gallery
            </Link>
            <Link href="/client" className={styles.heroBtnGhost}>
              <FiUser size={16} /> Client Login
            </Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO CAROUSEL */}
      <section className={styles.carouselSection}>
        <Carousel />
      </section>

      {/* SERVICES */}
      <section className={styles.services}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>What We Offer</span>
            <h2>Photography Services</h2>
            <p>From intimate portraits to large events — we cover it all.</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map(({ Icon, title, desc, from }) => (
              <div key={title} className={styles.serviceCard}>
                <div className={styles.serviceIcon}><Icon size={24} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className={styles.serviceFrom}>From {from}</span>
                <Link href="/book" className={styles.serviceBtn}>Book Now →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GALLERIES */}
      {featured.length > 0 && (
        <section className={styles.featured}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>Our Work</span>
              <h2>Featured Galleries</h2>
              <p>A selection of our recent photography work.</p>
            </div>
            <div className={styles.galleryGrid}>
              {featured.map((g) => (
                <Link href={`/gallery/${g.slug}`} key={g._id} className={styles.galleryCard}>
                  <div className={styles.galleryImg} style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
                    {g.coverUrl && (
                      <img src={g.coverUrl} alt={g.title} loading="lazy" />
                    )}
                    <span className={styles.galleryCount}><FiImage size={13} /> {g.photoCount || 0} photos</span>
                  </div>
                  <div className={styles.galleryInfo}>
                    <h3>{g.title}</h3>
                    <p>{g.category}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.viewAll}>
              <Link href="/gallery" className={styles.viewAllBtn}>View All Galleries →</Link>
            </div>
          </div>
        </section>
      )}

      {/* CLIENT PORTAL CTA */}
      <section className={styles.clientCta}>
        <div className={styles.sectionInner}>
          <div className={styles.clientCtaGrid}>
            <div>
              <span className={styles.sectionTag} style={{ color: "#a8d48a" }}>For Clients</span>
              <h2>Your Gallery is Ready</h2>
              <p>
                Already had a session with us? Access your private gallery to view,
                favourite and download your professional photos.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/client" className={styles.heroBtnPrimary}>
                  <FiUser size={16} /> Access My Gallery
                </Link>
              </div>
            </div>
            <div className={styles.clientCtaFeatures}>
              {[
                { Icon: FiImage, t: "View full-resolution photos" },
                { Icon: FiStar, t: "Mark your favourites" },
                { Icon: FiDownload, t: "Download your images" },
                { Icon: FiCalendar, t: "Gallery stays active" },
              ].map(({ Icon, t }) => (
                <div key={t} className={styles.clientFeature}>
                  <Icon size={18} /><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOOK CTA */}
      <section className={styles.bookCta}>
        <div className={styles.sectionInner}>
          <h2>Ready to Book Your Session?</h2>
          <p>Choose your package, pick a date, and we&apos;ll take care of the rest.</p>
          <Link href="/book" className={styles.heroBtnPrimary}>
            <FiCalendar size={16} /> Book Now
          </Link>
        </div>
      </section>

    </div>
  );
}
