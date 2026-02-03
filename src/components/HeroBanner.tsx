"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const bannerSlides = [
  {
    id: 1,
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER1-resized-1770155625520.jpg?width=8000&height=8000&resize=contain",
    alt: "Colección Fútbol 2026 - Productos promocionales mundialistas",
  },
  {
    id: 2,
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER2-resized-1770155627092.jpg?width=8000&height=8000&resize=contain",
    alt: "Conoce los Nuevos Productos 2026",
  },
  {
    id: 3,
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER3-resized-1770155628548.jpg?width=8000&height=8000&resize=contain",
    alt: "Super Bowl - Productos promocionales para el evento",
  },
  {
    id: 4,
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER4-resized-1770155629990.jpg?width=8000&height=8000&resize=contain",
    alt: "Feliz Día del Niño - Productos promocionales infantiles",
  },
  {
    id: 5,
    src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER6-1-resized-1770156711649.jpg?width=8000&height=8000&resize=contain",
    alt: "2drink es Tuyo - Botellas promocionales para hidratación",
  },
];

const AUTOPLAY_INTERVAL = 5000; // 5 seconds
const CROSSFADE_DURATION = 1500; // 1500ms for soft crossfade

export default function HeroBanner() {
  const totalSlides = bannerSlides.length;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
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
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
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
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    // Resume autoplay after 10s of no interaction
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
      className="relative w-full overflow-hidden bg-white dark:bg-[#0E0F12] transition-colors duration-300"
      data-autoplay={!reducedMotion && !isPaused ? "on" : "off"}
    >
      {/* Carousel container - Crossfade implementation */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-[480px] xl:h-[520px] min-h-[200px] max-h-[520px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stacked slides with crossfade */}
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: currentIndex === index ? 1 : 0,
              zIndex: currentIndex === index ? 1 : 0,
              transition: reducedMotion ? "none" : `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
            }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-contain lg:object-cover object-center"
              priority={index <= 1}
              loading={index <= 1 ? "eager" : "lazy"}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Arrow buttons - visible on hover */}
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
      </div>

      {/* Dots indicators */}
      <div className="flex justify-center items-center gap-[10px] sm:gap-[12px] py-3 sm:py-4">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`
              w-[6px] h-[6px] sm:w-[7px] sm:h-[7px] md:w-[8px] md:h-[8px]
              rounded-full transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9] focus-visible:ring-offset-2
              ${
                currentIndex === index
                  ? "bg-[#666666] dark:bg-[#AAAAAA] scale-110"
                  : "bg-[#CFCFCF] dark:bg-[#555555] hover:bg-[#AAAAAA] dark:hover:bg-[#777777]"
              }
            `}
            aria-label={`Ir al banner ${index + 1}`}
            aria-current={currentIndex === index ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  );
}
