"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-[9999] w-[64px] h-[64px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full bg-[#2EBCB3] flex items-center justify-center cursor-pointer shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2EBCB3]/50 focus-visible:ring-offset-2 motion-reduce:hover:transform-none"
      aria-label="Abrir chat de WhatsApp"
    >
      {/* Two chat bubbles matching reference exactly */}
      <svg
        viewBox="0 0 64 64"
        className="w-[36px] h-[36px] md:w-[44px] md:h-[44px] lg:w-[50px] lg:h-[50px]"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Back bubble (smaller, bottom-left with pointed tail) */}
        <path d="M6 42 C6 36, 10 32, 16 32 L22 32 C28 32, 32 36, 32 42 C32 48, 28 52, 22 52 L16 52 L10 58 L10 52 C10 52, 6 48, 6 42 Z" />
        
        {/* Front bubble (larger circle, top-right) */}
        <circle cx="40" cy="26" r="18" />
        
        {/* Three lines inside front bubble */}
        <line x1="30" y1="20" x2="50" y2="20" />
        <line x1="30" y1="26" x2="50" y2="26" />
        <line x1="30" y1="32" x2="50" y2="32" />
      </svg>
    </a>
  );
}
