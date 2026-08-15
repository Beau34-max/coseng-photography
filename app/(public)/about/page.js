import styles from "./about.module.css";

export const metadata = {
  title: "About",
  description: "About COSENG Photography — professional photography services.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.tag}>About Us</span>
          <h1>Photography That Tells Your Story</h1>
          <p>COSENG Photography captures life&apos;s most important moments with artistry, professionalism, and a personal touch.</p>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div>
              <h2>Our Approach</h2>
              <p>We believe that every photograph should feel natural, timeless, and full of emotion. Whether it&apos;s a family portrait, a once-in-a-lifetime wedding, or a commercial campaign, we bring the same dedication to every shoot.</p>
              <p>Based in the UK, COSENG Photography serves clients across London and the surrounding areas, as well as destination events worldwide.</p>
            </div>
            <div className={styles.statGrid}>
              {[
                { value: "500+", label: "Happy Clients" },
                { value: "50+", label: "Weddings Covered" },
                { value: "10K+", label: "Photos Delivered" },
                { value: "5★", label: "Average Rating" },
              ].map(({ value, label }) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What We Offer</h2>
          <div className={styles.servicesGrid}>
            {[
              { title: "Wedding Photography", desc: "Full-day coverage of your most special day, from getting ready to the last dance.", icon: "💍" },
              { title: "Portrait Sessions", desc: "Individual, family, or professional headshot sessions in studio or on location.", icon: "🎨" },
              { title: "Event Photography", desc: "Birthdays, corporate events, parties — we capture the energy and emotion.", icon: "🎉" },
              { title: "Commercial Photography", desc: "Product and brand photography for businesses looking to stand out.", icon: "📸" },
            ].map(({ title, desc, icon }) => (
              <div key={title} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to Work Together?</h2>
          <p>Book your session today and let&apos;s create something beautiful.</p>
          <div className={styles.ctaBtns}>
            <a href="/book" className={styles.ctaPrimary}>Book a Session</a>
            <a href="/contact" className={styles.ctaSecondary}>Get in Touch</a>
          </div>
        </div>
      </section>
    </div>
  );
}
