"use client";
import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Carousel.module.css";

const slides = [
  { src: "/photography/image1.jpg", label: "Birthday Photoshoot" },
  { src: "/photography/image2.jpg", label: "Children's Portraits" },
  { src: "/photography/image3.jpg", label: "Studio Session" },
  { src: "/photography/image4.jpg", label: "Family Portraits" },
  { src: "/photography/image5.jpg", label: "Special Occasions" },
  { src: "/photography/image6.jpg", label: "Event Photography" },
  { src: "/photography/image7.jpg", label: "Graduation Photos" },
  { src: "/photography/image9.jpg", label: "Portrait Session" },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, paused]);

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div key={slide.src} className={`${styles.slide} ${i === current ? styles.active : ""}`}>
          <img src={slide.src} alt={slide.label} />
          <div className={styles.overlay} />
          <div className={styles.caption}>
            <span>{slide.label}</span>
          </div>
        </div>
      ))}

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
        <FiChevronLeft size={28} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
        <FiChevronRight size={28} />
      </button>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
