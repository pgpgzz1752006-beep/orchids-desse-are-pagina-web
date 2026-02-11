"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [bottomOffset, setBottomOffset] = useState(24);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const buttonHeight = 90;
      const minBottom = 24;

      if (footerRect.top < windowHeight) {
        const overlap = windowHeight - footerRect.top + minBottom;
        setBottomOffset(overlap);
      } else {
        setBottomOffset(minBottom);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/529512424333"
        target="_blank"
        rel="noopener noreferrer"
          className="fixed right-6 z-[9999] w-[64px] h-[64px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full bg-[#25D366] flex items-center justify-center cursor-pointer shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 motion-reduce:hover:transform-none overflow-visible"
        style={{ bottom: `${bottomOffset}px` }}
        aria-label="Abrir WhatsApp +52 951 242 4333"
    >
      {/* White backplate for contrast */}
        <div className="w-[58px] h-[58px] md:w-[72px] md:h-[72px] lg:w-[82px] lg:h-[82px] rounded-full bg-white flex items-center justify-center overflow-visible">
            <img
              src="/icons/icon-whatsapp.png"
              alt="WhatsApp"
              className="w-[52px] h-[52px] md:w-[66px] md:h-[66px] lg:w-[76px] lg:h-[76px] object-contain block"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
      </div>
    </a>
  );
}
