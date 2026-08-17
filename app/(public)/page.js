import Link from "next/link";
import { connectToDb } from "@/lib/mongodb";
import { FiStar, FiCalendar, FiImage, FiUser, FiDownload } from "react-icons/fi";
import Carousel from "@/components/Carousel";
import styles from "./home.module.css";

export const revalidate = 60;

const HERO_DEFAULTS = {
  title: "Capturing Moments",
  titleAccent: "That Last Forever",
  subtitle:
    "Professional photography for portraits, events, commercial and community work. Delivering stunning images across Newcastle and the North East.",
  backgroundImage: null,
};

async function getHeroSettings() {
  try {
    const db = await connectToDb();
    const doc = await db.collection("settings").findOne({ key: "homepage" });
    return { ...HERO_DEFAULTS, ...(doc?.hero || {}) };
  } catch {
    return HERO_DEFAULTS;
  }
}

const SERVICE_DEFS = [
  { category: "Portrait",   title: "Portrait Sessions",    desc: "Individual and family portraits in studio or on location across the North East.", from: "£150", gradient: "linear-gradient(135deg,#1a1a2e 0%,#2d3561 100%)" },
  { category: "Event",      title: "Events & Occasions",   desc: "Birthdays, graduations, community events — we capture every moment.", from: "£200", gradient: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)" },
  { category: "Commercial", title: "Commercial",           desc: "Professional shots for businesses, brands and organisations.", from: "£300", gradient: "linear-gradient(135deg,#1c1c1c 0%,#3a3a3a 100%)" },
  { category: "Charity",    title: "Charity & Community",  desc: "Supporting charities and community groups across Newcastle. 4hrs — extra £100/hr thereafter.", from: "£400", gradient: "linear-gradient(135deg,#1a2f1a 0%,#2d5a27 100%)" },
];

async function getServicePhotos() {
  try {
    const db = await connectToDb();
    const photoMap = {};
    await Promise.all(SERVICE_DEFS.map(async ({ category }) => {
      const gallery = await db.collection("galleries").findOne(
        { category, coverImage: { $exists: true, $ne: "" } },
        { sort: { createdAt: -1 } }
      );
      if (gallery?.coverImage) photoMap[category] = gallery.coverImage;
    }));
    return photoMap;
  } catch { return {}; }
}

const stats = [
  { value: "4,300+", label: "Photos Delivered" },
  { value: "30+", label: "Galleries" },
  { value: "500+", label: "Happy Clients" },
  { value: "5★", label: "Average Rating" },
];

export default async function HomePage() {
  const [hero, servicePhotos] = await Promise.all([getHeroSettings(), getServicePhotos()]);

  const heroStyle = hero.backgroundImage
    ? { backgroundImage: `url(${hero.backgroundImage})` }
    : undefined;

  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero} style={heroStyle}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>Newcastle &amp; the North East</span>
          <h1 className={styles.heroTitle}>
            {hero.title}<br />
            <span className={styles.heroAccent}>{hero.titleAccent}</span>
          </h1>
          <p className={styles.heroSub}>{hero.subtitle}</p>
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
            {SERVICE_DEFS.map(({ category, title, desc, from, gradient }) => {
              const photo = servicePhotos[category];
              return (
                <div key={title} className={styles.serviceCard}>
                  <div className={styles.servicePhoto} style={{ background: gradient }}>
                    {photo && <img src={photo} alt={title} loading="lazy" />}
                    <div className={styles.servicePhotoOverlay} />
                  </div>
                  <div className={styles.serviceBody}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <span className={styles.serviceFrom}>From {from}</span>
                    <Link href="/book" className={styles.serviceBtn}>Book Now →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
