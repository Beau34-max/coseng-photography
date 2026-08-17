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
  const [slides, setSlides]       = useState(STATIC_SLIDES);
  const [idx, setIdx]             = useState(0);
  const [fading, setFading]       = useState(false);
  const [paused, setPaused]       = useState(false);
  const [barKey, setBarKey]       = useState(0);
  const busyRef                   = useRef(false);
  const nextRef                   = useRef(null);

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

  function goTo(newIdx) {
    if (busyRef.current) return;
    busyRef.current = true;
    setFading(true);
    setTimeout(() => {
      setIdx(newIdx);
      setFading(false);
      setBarKey((k) => k + 1);
      setTimeout(() => { busyRef.current = false; }, 100);
    }, 320);
  }

  function goNext() { goTo((idx + 1) % slides.length); }
  function goPrev() { goTo((idx - 1 + slides.length) % slides.length); }

  useEffect(() => { nextRef.current = goNext; });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => nextRef.current(), 4500);
    return () => clearInterval(t);
  }, [paused]);

  const slide = slides[idx];

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`${styles.slideWrap} ${fading ? styles.fading : ""}`}>
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.label}
          className={styles.photo}
        />
        <div className={styles.caption}>
          <span>{slide.label}</span>
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
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
