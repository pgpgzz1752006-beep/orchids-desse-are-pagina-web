"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-[9999] w-[64px] h-[64px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full bg-[#00B7B3] flex items-center justify-center cursor-pointer shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 focus-visible:ring-offset-2 motion-reduce:hover:transform-none"
      aria-label="Abrir chat de WhatsApp"
    >
      {/* Two chat bubbles with lines - matching reference */}
      <svg
        viewBox="0 0 64 64"
        className="w-[34px] h-[34px] md:w-[42px] md:h-[42px] lg:w-[48px] lg:h-[48px]"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Back bubble (smaller, bottom-left) */}
        <path d="M8 38 C8 42, 11 45, 15 45 L17 45 L17 52 L24 45 L28 45 C32 45, 35 42, 35 38 L35 30 C35 26, 32 23, 28 23 L15 23 C11 23, 8 26, 8 30 Z" />
        
        {/* Front bubble (larger, top-right) with lines */}
        <circle cx="40" cy="24" r="16" />
        
        {/* Three lines inside front bubble */}
        <line x1="32" y1="18" x2="48" y2="18" />
        <line x1="32" y1="24" x2="48" y2="24" />
        <line x1="32" y1="30" x2="48" y2="30" />
      </svg>
    </a>
  );
}
