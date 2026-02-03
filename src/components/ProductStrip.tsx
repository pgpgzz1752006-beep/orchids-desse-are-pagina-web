"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback, useId } from "react";

interface Product {
  name: string;
  image: string;
  href: string;
}

interface ProductStripProps {
  titleRegular: string;
  titleBold: string;
  products: Product[];
  autoplay?: boolean;
}

export default function ProductStrip({ titleRegular, titleBold, products, autoplay = false }: ProductStripProps) {
  const carouselId = useId();
  const totalOriginal = products.length;
  
  // For infinite loop: [last N products, ...all products, first N products]
  // N = max visible cards (5 for desktop)
  const cloneCount = 5;
  
  const extendedProducts = autoplay 
    ? [
        ...products.slice(-cloneCount), // Clone of last N
        ...products,                     // All original
        ...products.slice(0, cloneCount) // Clone of first N
      ]
    : products;
  
  // Start index: cloneCount (first real product)
  const startIndex = autoplay ? cloneCount : 0;
  
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Touch/drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Visible cards per breakpoint
  const getVisibleCards = useCallback(() => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth >= 1024) return 5;
    if (window.innerWidth >= 768) return 3;
    return 2;
  }, []);
  
  const [visibleCards, setVisibleCards] = useState(5);
  
  // Mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Check reduced motion preference
  useEffect(() => {
    if (!isMounted) return;
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [isMounted]);
  
  // Update visible cards on resize
  useEffect(() => {
    if (!isMounted) return;
    
    const handleResize = () => setVisibleCards(getVisibleCards());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleCards, isMounted]);
  
  // Calculate card width percentage
  const cardWidthPercent = 100 / visibleCards;
  
  // Handle transition end - invisible reset for seamless loop
  const handleTransitionEnd = useCallback(() => {
    if (!autoplay) return;
    
    // If scrolled past real products (into end clones), jump to start of real products
    if (currentIndex >= cloneCount + totalOriginal) {
      setIsTransitioning(false);
      setCurrentIndex(cloneCount + (currentIndex - cloneCount - totalOriginal));
    }
    // If scrolled before real products (into start clones), jump to end of real products
    else if (currentIndex < cloneCount) {
      setIsTransitioning(false);
      setCurrentIndex(cloneCount + totalOriginal - (cloneCount - currentIndex));
    }
  }, [autoplay, currentIndex, totalOriginal, cloneCount]);
  
  // Re-enable transition after instant jump
  useEffect(() => {
    if (!isTransitioning && isMounted) {
      // Force reflow then re-enable transition
      if (trackRef.current) {
        trackRef.current.offsetHeight;
      }
      const timeout = setTimeout(() => setIsTransitioning(true), 20);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, isMounted]);
  
  // Autoplay logic
  useEffect(() => {
    if (!isMounted || !autoplay) return;
    
    if (isPaused || prefersReducedMotion) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      return;
    }
    
    autoplayRef.current = setInterval(() => {
      if (isTransitioning) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 10000);
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [isMounted, autoplay, isPaused, prefersReducedMotion, isTransitioning]);
  
  const goToNext = useCallback(() => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning]);
  
  const goToPrev = useCallback(() => {
    if (!isTransitioning) return;
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning]);
  
  // Pause autoplay and resume after 10s
  const pauseAndResume = useCallback(() => {
    if (!autoplay) return;
    setIsPaused(true);
    
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  }, [autoplay]);
  
  // Handle hover pause
  const handleMouseEnter = () => {
    if (autoplay && !prefersReducedMotion) {
      setIsPaused(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (autoplay && !prefersReducedMotion) {
      setIsPaused(false);
    }
  };
  
  // Touch/drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    if (autoplay) pauseAndResume();
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (dragOffset < -threshold) {
      goToNext();
    } else if (dragOffset > threshold) {
      goToPrev();
    }
    setDragOffset(0);
  };
  
  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (autoplay) pauseAndResume();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (dragOffset < -threshold) {
      goToNext();
    } else if (dragOffset > threshold) {
      goToPrev();
    }
    setDragOffset(0);
  };
  
  // Arrow click handlers
  const handlePrevClick = () => {
    goToPrev();
    if (autoplay) pauseAndResume();
  };
  
  const handleNextClick = () => {
    goToNext();
    if (autoplay) pauseAndResume();
  };
  
  // Calculate transform
  const baseTranslate = -(currentIndex * cardWidthPercent);
  const dragTranslatePercent = containerRef.current 
    ? (dragOffset / containerRef.current.offsetWidth) * 100 
    : 0;
  const translateX = baseTranslate + dragTranslatePercent;
  
  // Calculate active dot index (for real products only)
  const getRealIndex = () => {
    if (!autoplay) return currentIndex;
    // Map extended index to real product index
    const realIdx = ((currentIndex - cloneCount) % totalOriginal + totalOriginal) % totalOriginal;
    return realIdx;
  };
  
  const activeDot = getRealIndex();
  const totalDots = Math.min(totalOriginal, 5);
  
  return (
    <section 
      className="w-full bg-white dark:bg-[#0E0F12] py-14 md:py-16 lg:py-[72px] transition-colors duration-300"
      data-autoplay={autoplay ? "on" : "off"}
      data-carousel-id={carouselId}
    >
      <div className="w-full max-w-[1320px] mx-auto px-6 md:px-10 lg:px-10">
        {/* Title */}
        <h2 className="text-center font-['Montserrat'] text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-[#111111] dark:text-[#F2F2F2] mb-10 md:mb-12">
          <span className="font-normal">{titleRegular} </span>
          <span className="font-extrabold">{titleBold}</span>
        </h2>

        {/* Carousel Container */}
        <div 
          className="relative flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Arrow */}
          <button
            onClick={handlePrevClick}
            className="hidden md:flex absolute left-0 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] transition-colors duration-180 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Products Track */}
          <div 
            ref={containerRef}
            className="w-full md:px-14 lg:px-16 overflow-hidden select-none py-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              ref={trackRef}
              className="flex"
              style={{
                transform: `translateX(${translateX}%)`,
                transition: isTransitioning && !isDragging 
                  ? "transform 700ms ease-in-out" 
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="flex-shrink-0 px-2 lg:px-[10px]"
                  style={{ width: `${cardWidthPercent}%` }}
                >
                    <a
                      href={product.href}
                      className="block bg-white dark:bg-[#1A1D24] border border-[#D9D9D9] dark:border-[#2A2D34] rounded-[11px] p-3 lg:p-[14px] flex flex-col will-change-transform transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[4px] hover:scale-[1.02] hover:border-[#BDBDBD] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] active:translate-y-[-2px] active:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/60 focus-visible:ring-offset-2 motion-reduce:hover:transform-none motion-reduce:hover:shadow-sm"
                      onClick={(e) => isDragging && e.preventDefault()}
                      draggable={false}
                    >
                    {/* Image Container */}
                    <div className="flex items-center justify-center h-[100px] md:h-[110px] lg:h-[120px] mb-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="max-h-[90px] md:max-h-[100px] lg:max-h-[110px] w-auto object-contain pointer-events-none"
                        draggable={false}
                      />
                    </div>

                    {/* Product Name */}
                      <p className="font-['Montserrat'] text-[10px] md:text-[11px] lg:text-[11px] font-medium text-[#333333] dark:text-[#E0E0E0] text-center uppercase leading-[1.4] min-h-[28px]">
                        {product.name}
                      </p>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNextClick}
            className="hidden md:flex absolute right-0 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] transition-colors duration-180 cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalDots }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                i === (activeDot % totalDots) ? "bg-[#333333]" : "bg-[#D9D9D9]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
