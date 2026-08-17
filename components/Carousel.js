"use client";
import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { addWatermark } from "@/lib/photo-utils";
import styles from "./Carousel.module.css";

const STATIC_SLIDES = [
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
  const [slides, setSlides] = useState(STATIC_SLIDES);
  const [idx, setIdx] = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const busyRef = useRef(false);

  // Fetch homepage photos from admin; fall back to static if none configured
  useEffect(() => {
    fetch("/api/photos/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          let mapped = data.map((p) => ({ src: addWatermark(p.url), label: p.caption || "Our Work" }));
          // Always fill at least 3 panels so no black slot shows
          if (mapped.length === 1) mapped = [mapped[0], mapped[0], mapped[0]];
          else if (mapped.length === 2) mapped = [...mapped, mapped[0]];
          setSlides(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const N = slides.length;
  const EXT = [...slides, ...slides];

  function goNext() {
    if (busyRef.current) return;
    busyRef.current = true;
    setAnimated(true);
    setBarKey((k) => k + 1);

    setIdx((i) => {
      const next = i + 1;
      if (next >= N) {
        setTimeout(() => {
          setAnimated(false);
          setIdx(0);
          setTimeout(() => {
            setAnimated(true);
            busyRef.current = false;
          }, 40);
        }, 680);
        return N;
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
            transform: `translateX(calc(${-idx} * (100vw / 3)))`,
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
