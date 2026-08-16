"use client";
import { useState, useEffect, useRef } from "react";
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

const N = SLIDES.length;
// Duplicate slides so forward scroll wraps seamlessly
const EXT = [...SLIDES, ...SLIDES];

export default function Carousel() {
  const [idx, setIdx] = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const busyRef = useRef(false);

  function goNext() {
    if (busyRef.current) return;
    busyRef.current = true;
    setAnimated(true);
    setBarKey((k) => k + 1);

    setIdx((i) => {
      const next = i + 1;
      if (next >= N) {
        // Slide to EXT[N] (clone of first slide), then silently snap to 0
        setTimeout(() => {
          setAnimated(false);
          setIdx(0);
          setTimeout(() => {
            setAnimated(true);
            busyRef.current = false;
          }, 40);
        }, 680);
        return N; // momentarily show second copy
      }
      setTimeout(() => { busyRef.current = false; }, 680);
      return next;
    });
  }

  function goPrev() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBarKey((k) => k + 1);

    setIdx((i) => {
      if (i === 0) {
        // Silently jump to N (end of first copy = same visuals), then animate to N-1
        setAnimated(false);
        setTimeout(() => {
          setIdx(N);
          setTimeout(() => {
            setAnimated(true);
            setIdx(N - 1);
            setTimeout(() => { busyRef.current = false; }, 680);
          }, 40);
        }, 0);
        return 0;
      }
      setAnimated(true);
      setTimeout(() => { busyRef.current = false; }, 680);
      return i - 1;
    });
  }

  // Auto-advance using a ref to always call latest goNext
  const nextRef = useRef(goNext);
  useEffect(() => { nextRef.current = goNext; });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => nextRef.current(), 4000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{
            transform: `translateX(calc(${-idx} * var(--slide-w)))`,
            transition: animated
              ? "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          {EXT.map((slide, i) => (
            <div key={i} className={styles.slide}>
              <img src={slide.src} alt={slide.label} />
              <div className={styles.caption}>
                <span>{slide.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar — resets on each advance */}
      {!paused && <div key={barKey} className={styles.progressBar} />}

      <button
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={goPrev}
        aria-label="Previous"
      >
        <FiChevronLeft size={30} />
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={goNext}
        aria-label="Next"
      >
        <FiChevronRight size={30} />
      </button>
    </section>
  );
}
