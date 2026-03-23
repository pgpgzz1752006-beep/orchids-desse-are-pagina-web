"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface BannerSlide {
  id: string;
  src: string;
  alt: string;
  link_url: string | null;
}

// Fallback banners in case the DB is unreachable
const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: "1",
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER1-resized-1770155625520.jpg?width=8000&height=8000&resize=contain",
    alt: "Colección Fútbol 2026 - Productos promocionales mundialistas",
    link_url: null,
  },
  {
    id: "2",
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER2-resized-1770155627092.jpg?width=8000&height=8000&resize=contain",
    alt: "Conoce los Nuevos Productos 2026",
    link_url: null,
  },
  {
    id: "4",
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER4-resized-1770155629990.jpg?width=8000&height=8000&resize=contain",
    alt: "Feliz Día del Niño - Productos promocionales infantiles",
    link_url: null,
  },
  {
    id: "5",
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER6-1-resized-1770156711649.jpg?width=8000&height=8000&resize=contain",
    alt: "2drink es Tuyo - Botellas promocionales para hidratación",
    link_url: null,
  },
];

const AUTOPLAY_INTERVAL = 5000;
const CROSSFADE_DURATION = 1500;

export default function HeroBanner() {
  const [slides, setSlides] = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Mount + fetch banners from DB
  useEffect(() => {
    setIsMounted(true);

    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((data) => {
        const active: BannerSlide[] = (data.banners ?? [])
          .filter((b: { is_active: boolean }) => b.is_active)
          .map((b: { id: string; image_url: string; alt_text: string; link_url: string | null }) => ({
            id: b.id,
            src: b.image_url,
            alt: b.alt_text || "",
            link_url: b.link_url ?? null,
          }));
        if (active.length > 0) {
          setSlides(active);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        // Keep fallback slides on error
      });
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    if (!isMounted) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [isMounted]);

  const totalSlides = slides.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay logic
  useEffect(() => {
    if (!isMounted || reducedMotion || isPaused) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }
    autoplayRef.current = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isMounted, reducedMotion, isPaused, goToNext]);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleDotClick = (index: number) => {
    goToSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handlePrevClick = () => {
    goToPrev();
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleNextClick = () => {
    goToNext();
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section
      className="relative w-full bg-white dark:bg-[#0E0F12] transition-colors duration-300 -mt-1"
      data-autoplay={!reducedMotion && !isPaused ? "on" : "off"}
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] sm:aspect-[16/9] lg:aspect-[19/7] xl:h-[clamp(480px,48vh,640px)] 2xl:h-[clamp(520px,52vh,720px)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stacked slides with crossfade */}
        {slides.map((slide, index) => {
          const inner = (
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-contain sm:object-contain lg:object-cover object-[18%_50%] lg:object-[18%_50%] 2xl:object-[15%_50%]"
              priority={index <= 1}
              loading={index <= 1 ? "eager" : "lazy"}
              sizes="100vw"
            />
          );

          return (
            <div
              key={slide.id}
              className="absolute inset-0 w-full h-full"
              style={{
                opacity: currentIndex === index ? 1 : 0,
                zIndex: currentIndex === index ? 1 : 0,
                transition: reducedMotion ? "none" : `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
              }}
            >
              {slide.link_url ? (
                <a href={slide.link_url} className="block w-full h-full" tabIndex={-1}>
                  {inner}
                </a>
              ) : (
                inner
              )}
            </div>
          );
        })}

        {/* Arrow buttons */}
        <button
          onClick={handlePrevClick}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-[#1A1D24]/80 hover:bg-white dark:hover:bg-[#1A1D24] rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9] focus-visible:ring-offset-2 z-10"
          aria-label="Banner anterior"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNextClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-[#1A1D24]/80 hover:bg-white dark:hover:bg-[#1A1D24] rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9] focus-visible:ring-offset-2 z-10"
          aria-label="Banner siguiente"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-white w-5"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Ir al banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
