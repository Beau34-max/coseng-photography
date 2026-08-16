"use client";
import { useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./Carousel.module.css";

const SLIDES = [
  { src: "/photography/image1.jpg", label: "Birthday Photoshoot" },
  { src: "/photography/image2.jpg", label: "Children's Portraits" },
  { src: "/photography/image3.jpg", label: "Studio Session" },
  { src: "/photography/image4.jpg", label: "Family Portraits" },
  { src: "/photography/image5.jpg", label: "Special Occasions" },
  { src: "/photography/image6.jpg", label: "Event Photography" },
  { src: "/photography/image7.jpg", label: "Graduation Photos" },
  { src: "/photography/image9.jpg", label: "Portrait Session" },
];

const SPEED = 0.55; // pixels per frame

export default function Carousel() {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const slideWRef = useRef(0);
  const totalWRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const firstSlide = track.firstElementChild;
    const w = firstSlide.offsetWidth + 6; // +6 for gap
    slideWRef.current = w;
    totalWRef.current = w * SLIDES.length;

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current -= SPEED;
        if (Math.abs(posRef.current) >= totalWRef.current) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function jump(dir) {
    if (!slideWRef.current) return;
    posRef.current += dir * slideWRef.current;
    if (posRef.current > 0) posRef.current = -(totalWRef.current - slideWRef.current);
    if (Math.abs(posRef.current) >= totalWRef.current) posRef.current = 0;
  }

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {[...SLIDES, ...SLIDES].map((slide, i) => (
            <div key={i} className={styles.slide}>
              <img src={slide.src} alt={slide.label} />
              <div className={styles.caption}>
                <span>{slide.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={() => jump(1)}
        aria-label="Previous"
      >
        <FiChevronLeft size={30} />
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={() => jump(-1)}
        aria-label="Next"
      >
        <FiChevronRight size={30} />
      </button>
    </section>
  );
}
