"use client";
import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { addWatermark } from "@/lib/photo-utils";
import styles from "./Carousel.module.css";

const STATIC_SLIDES = [
  { src: "/photography/image1.jpg",  label: "Birthday Photoshoot" },
  { src: "/photography/image2.jpg",  label: "Children's Portraits" },
  { src: "/photography/image3.jpg",  label: "Studio Session" },
  { src: "/photography/image4.jpg",  label: "Family Portraits" },
  { src: "/photography/image5.jpg",  label: "Special Occasions" },
  { src: "/photography/image6.jpg",  label: "Event Photography" },
  { src: "/photography/image7.jpg",  label: "Graduation Photos" },
  { src: "/photography/image9.jpg",  label: "Portrait Session" },
];

export default function Carousel() {
  const [slides, setSlides]     = useState(STATIC_SLIDES);
  const [offset, setOffset]     = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused]     = useState(false);
  const [barKey, setBarKey]     = useState(0);
  const busyRef  = useRef(false);
  const trackRef = useRef(null);
  const nextRef  = useRef(null);

  useEffect(() => {
    fetch("/api/photos/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((p) => ({
            src: addWatermark(p.url),
            label: p.caption || "Our Work",
          })));
          setOffset(0);
        }
      })
      .catch(() => {});
  }, []);

  // Width of the first (non-duplicated) half of the track
  function halfWidth() {
    return trackRef.current
      ? Math.round(trackRef.current.scrollWidth / 2)
      : window.innerWidth;
  }

  function step() {
    return window.innerWidth;
  }

  function goNext() {
    if (busyRef.current) return;
    busyRef.current = true;
    setAnimated(true);
    setBarKey((k) => k + 1);

    setOffset((o) => {
      const next = o + step();
      const half = halfWidth();

      if (next >= half) {
        // Slide to the duplicate, then silently reset
        setTimeout(() => {
          setAnimated(false);
          setOffset(next - half);
          setTimeout(() => {
            setAnimated(true);
            busyRef.current = false;
          }, 40);
        }, 680);
      } else {
        setTimeout(() => { busyRef.current = false; }, 680);
      }
      return next;
    });
  }

  function goPrev() {
    if (busyRef.current) return;
    busyRef.current = true;
    setAnimated(true);
    setBarKey((k) => k + 1);

    setOffset((o) => {
      if (o <= 0) {
        // Jump to end of first half, then slide back
        const half = halfWidth();
        setAnimated(false);
        setTimeout(() => {
          const dest = half - step();
          setOffset(dest >= 0 ? dest : 0);
          setTimeout(() => {
            setAnimated(true);
            busyRef.current = false;
          }, 40);
        }, 0);
        return 0;
      }
      setTimeout(() => { busyRef.current = false; }, 680);
      return Math.max(0, o - step());
    });
  }

  useEffect(() => { nextRef.current = goNext; });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => nextRef.current(), 4500);
    return () => clearInterval(t);
  }, [paused]);

  // Duplicate the strip for seamless loop
  const EXT = [...slides, ...slides];

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className={styles.track}
        style={{
          transform: `translateX(${-offset}px)`,
          transition: animated
            ? "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
        }}
      >
        {EXT.map((slide, i) => (
          <div key={i} className={styles.slide}>
            <img src={slide.src} alt={slide.label} className={styles.photo} />
            <div className={styles.caption}><span>{slide.label}</span></div>
          </div>
        ))}
      </div>

      {!paused && <div key={barKey} className={styles.progressBar} />}

      <button
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={goPrev}
        aria-label="Previous"
      >
        <FiChevronLeft size={28} />
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={goNext}
        aria-label="Next"
      >
        <FiChevronRight size={28} />
      </button>
    </section>
  );
}
