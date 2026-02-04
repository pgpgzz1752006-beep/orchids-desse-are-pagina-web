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

// Marquee speed configuration (px per second)
const MARQUEE_SPEED_DESKTOP = 30;
const MARQUEE_SPEED_MOBILE = 22;

export default function ProductStrip({ titleRegular, titleBold, products, autoplay = false }: ProductStripProps) {
  const carouselId = useId();
  
  // Duplicate products for seamless loop: items + items
  const duplicatedProducts = [...products, ...products];
  
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Touch/drag state for manual interaction
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  
  // Get speed based on viewport
  const getSpeed = useCallback(() => {
    if (typeof window === "undefined") return MARQUEE_SPEED_DESKTOP;
    return window.innerWidth < 768 ? MARQUEE_SPEED_MOBILE : MARQUEE_SPEED_DESKTOP;
  }, []);
  
  const [speed, setSpeed] = useState(MARQUEE_SPEED_DESKTOP);
  
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
  
  // Update speed on resize
  useEffect(() => {
    if (!isMounted) return;
    
    const handleResize = () => {
      setSpeed(getSpeed());
      // Recalculate track width
      if (trackRef.current) {
        setTrackWidth(trackRef.current.scrollWidth / 2);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getSpeed, isMounted]);
  
  // Calculate track width once mounted
  useEffect(() => {
    if (!isMounted || !trackRef.current) return;
    
    // Wait for layout to settle
    const timeout = setTimeout(() => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.scrollWidth / 2);
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [isMounted, products]);
  
  // Continuous marquee animation using requestAnimationFrame
  useEffect(() => {
    if (!isMounted || !autoplay || prefersReducedMotion || trackWidth === 0) {
      return;
    }
    
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      if (!isPaused && !isDragging) {
        setOffset((prevOffset) => {
          // Move by speed * deltaTime (in ms, so divide by 1000)
          let newOffset = prevOffset + (speed * deltaTime) / 1000;
          
          // Wrap seamlessly when we've scrolled past half the track
          if (newOffset >= trackWidth) {
            newOffset = newOffset - trackWidth;
          }
          
          return newOffset;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isMounted, autoplay, isPaused, isDragging, prefersReducedMotion, speed, trackWidth]);
  
  // Handle hover pause
  const handleMouseEnter = () => {
    if (autoplay && !prefersReducedMotion) {
      setIsPaused(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (autoplay && !prefersReducedMotion && !isDragging) {
      setIsPaused(false);
    }
  };
  
  // Touch/drag handlers for manual nudging
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragStartOffset(offset);
    lastTimeRef.current = 0; // Reset time ref
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX; // Inverted for natural scroll feel
    let newOffset = dragStartOffset + diff;
    
    // Wrap offset
    if (newOffset < 0) newOffset = trackWidth + newOffset;
    if (newOffset >= trackWidth) newOffset = newOffset - trackWidth;
    
    setOffset(newOffset);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTimeRef.current = 0;
    // Don't resume immediately, let animation loop handle it
  };
  
  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStartOffset(offset);
    lastTimeRef.current = 0;
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const diff = startX - e.clientX;
    let newOffset = dragStartOffset + diff;
    
    // Wrap offset
    if (newOffset < 0) newOffset = trackWidth + newOffset;
    if (newOffset >= trackWidth) newOffset = newOffset - trackWidth;
    
    setOffset(newOffset);
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    lastTimeRef.current = 0;
    // Resume animation naturally
    if (!isPaused) {
      // Animation continues in the useEffect
    }
  };
  
  // Arrow click handlers - nudge the carousel
  const nudgeAmount = 200; // px
  
  const handlePrevClick = () => {
    let newOffset = offset - nudgeAmount;
    if (newOffset < 0) newOffset = trackWidth + newOffset;
    setOffset(newOffset);
  };
  
  const handleNextClick = () => {
    let newOffset = offset + nudgeAmount;
    if (newOffset >= trackWidth) newOffset = newOffset - trackWidth;
    setOffset(newOffset);
  };
  
  // For reduced motion: show static carousel with manual navigation
  if (prefersReducedMotion && autoplay) {
    return (
      <section 
        className="w-full bg-white dark:bg-[#0E0F12] py-14 md:py-16 lg:py-[72px] transition-colors duration-300"
        data-autoplay="reduced-motion"
        data-carousel-id={carouselId}
      >
        <div className="w-full max-w-[1320px] mx-auto px-6 md:px-10 lg:px-10">
          <h2 className="text-center font-['Montserrat'] text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-[#111111] dark:text-[#F2F2F2] mb-10 md:mb-12">
            <span className="font-normal">{titleRegular} </span>
            <span className="font-extrabold">{titleBold}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 5).map((product, index) => (
              <a
                key={`${product.name}-${index}`}
                href={product.href}
                className="block bg-white dark:bg-[#1A1D24] border border-[#D9D9D9] dark:border-[#2A2D34] rounded-[11px] p-3 lg:p-[14px] flex flex-col transition-all duration-200 hover:border-[#BDBDBD] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/60 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-center h-[100px] md:h-[110px] lg:h-[120px] mb-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="max-h-[90px] md:max-h-[100px] lg:max-h-[110px] w-auto object-contain"
                  />
                </div>
                <p className="font-['Montserrat'] text-[10px] md:text-[11px] font-medium text-[#333333] dark:text-[#E0E0E0] text-center uppercase leading-[1.4] min-h-[28px]">
                  {product.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
    return (
      <section 
        className="w-full bg-white dark:bg-[#0E0F12] py-14 md:py-16 lg:py-[72px] transition-colors duration-300 overflow-hidden"
        data-autoplay={autoplay ? "on" : "off"}
        data-carousel-id={carouselId}
      >
        {/* Title - centered with max-width */}
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 mb-10 md:mb-12">
          <h2 className="text-center font-['Montserrat'] text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-[#111111] dark:text-[#F2F2F2]">
            <span className="font-normal">{titleRegular} </span>
            <span className="font-extrabold">{titleBold}</span>
          </h2>
        </div>

        {/* Full-width Carousel Container */}
        <div 
          className="relative w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Arrow - positioned at edge */}
          <button
            onClick={handlePrevClick}
            className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] dark:text-[#888888] dark:hover:text-[#CCCCCC] transition-colors duration-180 cursor-pointer bg-white/80 dark:bg-[#0E0F12]/80 rounded-full shadow-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Products Track - Full width marquee */}
          <div 
            ref={containerRef}
            className="w-full overflow-hidden select-none pt-[12px] pb-[16px] px-2 md:px-4"
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
              className="flex will-change-transform"
              style={{
                transform: `translateX(-${offset}px)`,
              }}
            >
              {duplicatedProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="flex-shrink-0 px-2 lg:px-[10px]"
                  style={{ width: "220px" }}
                >
                  <a
                    href={product.href}
                    className="block bg-white dark:bg-[#1A1D24] border border-[#D9D9D9] dark:border-[#2A2D34] rounded-[11px] p-3 lg:p-[14px] flex flex-col will-change-transform transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[6px] hover:scale-[1.04] hover:border-[#BDBDBD] hover:shadow-[0_16px_34px_rgba(0,0,0,0.14)] dark:hover:border-[#3A3D44] dark:hover:shadow-[0_16px_34px_rgba(0,0,0,0.3)] active:-translate-y-[3px] active:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/60 focus-visible:ring-offset-2 motion-reduce:hover:transform-none motion-reduce:hover:shadow-sm"
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

          {/* Right Arrow - positioned at edge */}
          <button
            onClick={handleNextClick}
            className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] dark:text-[#888888] dark:hover:text-[#CCCCCC] transition-colors duration-180 cursor-pointer bg-white/80 dark:bg-[#0E0F12]/80 rounded-full shadow-sm"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>
      </section>
    );
}
