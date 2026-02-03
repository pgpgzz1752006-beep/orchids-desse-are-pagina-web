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
const TRANSITION_DURATION = 700; // 700ms

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      console.log("autoplay disabled: reduced motion");
    }

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        console.log("autoplay disabled: reduced motion");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % bannerSlides.length;
    goToSlide(next);
    console.log("banner autoplay tick", "HeroBanner", Date.now(), "slide:", next);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + bannerSlides.length) % bannerSlides.length;
    goToSlide(prev);
  }, [currentSlide, goToSlide]);

  // Autoplay logic
  useEffect(() => {
    if (reducedMotion || isPaused) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }

    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [reducedMotion, isPaused, nextSlide]);

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
        nextSlide();
      } else {
        prevSlide();
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
    // Resume autoplay after 10s
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-white dark:bg-[#0E0F12] transition-colors duration-300"
      data-autoplay={!reducedMotion && !isPaused ? "on" : "off"}
    >
        {/* Carousel container - aspect-ratio for mobile/tablet, fixed height for desktop */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-[480px] xl:h-[520px] min-h-[200px] max-h-[520px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
        {/* Track */}
        <div
          className="flex h-full will-change-transform"
          style={{
            width: `${bannerSlides.length * 100}%`,
            transform: `translateX(-${(currentSlide * 100) / bannerSlides.length}%)`,
            transition: reducedMotion
              ? "none"
              : `transform ${TRANSITION_DURATION}ms ease-in-out`,
          }}
        >
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative h-full flex-shrink-0"
              style={{ width: `${100 / bannerSlides.length}%` }}
            >
              <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-[center_30%] sm:object-[center_35%] md:object-center"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                />
            </div>
          ))}
        </div>

        {/* Arrow buttons (optional - hidden by default, show on hover) */}
        <button
          onClick={() => {
            prevSlide();
            setIsPaused(true);
            setTimeout(() => setIsPaused(false), 10000);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9] focus-visible:ring-offset-2 z-10"
          aria-label="Banner anterior"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => {
            nextSlide();
            setIsPaused(true);
            setTimeout(() => setIsPaused(false), 10000);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9] focus-visible:ring-offset-2 z-10"
          aria-label="Banner siguiente"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                currentSlide === index
                  ? "bg-[#666666] scale-110"
                  : "bg-[#CFCFCF] hover:bg-[#AAAAAA]"
              }
            `}
            aria-label={`Ir al banner ${index + 1}`}
            aria-current={currentSlide === index ? "true" : "false"}
          />
        ))}
      </div>
    </section>
  );
}
