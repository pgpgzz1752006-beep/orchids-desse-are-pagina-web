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
        <div className="w-[54px] h-[54px] md:w-[68px] md:h-[68px] lg:w-[78px] lg:h-[78px] rounded-full bg-white flex items-center justify-center overflow-visible">
            <img
              src="/icons/icon-whatsapp.png"
              alt="WhatsApp"
              className="w-[46px] h-[46px] md:w-[58px] md:h-[58px] lg:w-[68px] lg:h-[68px] object-contain block"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
      </div>
    </a>
  );
}
