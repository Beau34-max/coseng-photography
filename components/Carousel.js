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
  const [idx, setIdx]           = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused]     = useState(false);
  const [barKey, setBarKey]     = useState(0);
  const busyRef                 = useRef(false);
  const nextRef                 = useRef(null);

  useEffect(() => {
    fetch("/api/photos/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map((p) => ({
            src: addWatermark(p.url),
            label: p.caption || "Our Work",
          })));
        }
      })
      .catch(() => {});
  }, []);

  const N   = slides.length;
  // Duplicate for seamless loop: [...slides, ...slides]
  const EXT = [...slides, ...slides];

  function goNext() {
    if (busyRef.current) return;
    busyRef.current = true;
    setAnimated(true);
    setBarKey((k) => k + 1);
    setIdx((i) => {
      const next = i + 1;
      if (next >= N) {
        // Silent reset after transition
        setTimeout(() => {
          setAnimated(false);
          setIdx(0);
          setTimeout(() => { setAnimated(true); busyRef.current = false; }, 40);
        }, 650);
        return N; // momentarily land on duplicate
      }
      setTimeout(() => { busyRef.current = false; }, 650);
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
            setTimeout(() => { busyRef.current = false; }, 650);
          }, 40);
        }, 0);
        return 0;
      }
      setAnimated(true);
      setTimeout(() => { busyRef.current = false; }, 650);
      return i - 1;
    });
  }

  useEffect(() => { nextRef.current = goNext; });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => nextRef.current(), 4500);
    return () => clearInterval(t);
  }, [paused]);

  const displayIdx = idx % N; // for dots

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={styles.track}
        style={{
          transform: `translateX(calc(${-idx} * 100vw))`,
          transition: animated ? "transform 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      >
        {EXT.map((slide, i) => (
          <div key={i} className={styles.slide}>
            <img src={slide.src} alt={slide.label} className={styles.photo} />
            <div className={styles.caption}><span>{slide.label}</span></div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {N > 1 && (
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === displayIdx ? styles.dotActive : ""}`}
              onClick={() => {
                if (!busyRef.current) {
                  busyRef.current = true;
                  setAnimated(true);
                  setIdx(i);
                  setBarKey((k) => k + 1);
                  setTimeout(() => { busyRef.current = false; }, 650);
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!paused && <div key={barKey} className={styles.progressBar} />}

      {/* Arrows */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={goPrev} aria-label="Previous">
        <FiChevronLeft size={28} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={goNext} aria-label="Next">
        <FiChevronRight size={28} />
      </button>
    </section>
  );
}
