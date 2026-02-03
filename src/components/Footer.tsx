"use client";

import Image from "next/image";

const menuLinks = [
  { label: "Categorías", href: "/categorias" },
  { label: "Productos", href: "/productos" },
  { label: "Nuevos", href: "/nuevos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

const colorBarSegments = [
  { color: "#F3E300", width: "12%" },
  { color: "#7BC043", width: "14%" },
  { color: "#1FB6FF", width: "16%" },
  { color: "#198FD6", width: "14%" },
  { color: "#1A3D8F", width: "14%" },
  { color: "#E0007A", width: "12%" },
  { color: "#6A1B9A", width: "12%" },
  { color: "#3E2A84", width: "6%" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      {/* Multicolor Bar */}
      <div className="w-full h-[12px] flex">
        {colorBarSegments.map((segment, index) => (
          <div
            key={index}
            style={{ backgroundColor: segment.color, width: segment.width }}
          />
        ))}
      </div>

      {/* Footer Content */}
      <div className="w-full bg-[#F5F5F5] pt-6 md:pt-7 lg:pt-[26px] pb-5 md:pb-6 lg:pb-6">
        <div className="w-full max-w-[1540px] mx-auto px-4 md:px-10 lg:px-[56px]">
            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1.4fr_1fr] gap-6 md:gap-4 lg:gap-6 items-start">
            {/* Column 1: Logo */}
            <div className="flex justify-center md:justify-start max-w-[300px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGOTIPO-1770138421366.png?width=8000&height=8000&resize=contain"
                alt="Diseñare Promocionales"
                width={260}
                height={120}
                className="w-[180px] md:w-[220px] lg:w-[260px] h-auto object-contain"
              />
            </div>

            {/* Column 2: Contáctanos */}
            <div className="flex flex-col items-center justify-start text-center">
              <h3 className="font-['Montserrat'] text-[24px] md:text-[26px] lg:text-[28px] font-semibold text-[#111111] leading-[1.1]">
                Contáctanos
              </h3>
              {/* Desktop/Tablet: single row, no wrap */}
              <div className="hidden md:flex flex-nowrap items-center justify-center gap-[14px] lg:gap-[16px] mt-[12px] md:mt-[14px] lg:mt-[16px] whitespace-nowrap">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Instagram"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-06-1770149849866.png?width=200&height=200&resize=contain"
                    alt="Instagram"
                    width={60}
                    height={60}
                    className="w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] object-contain block"
                  />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Facebook"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-09-1770149791022.png?width=200&height=200&resize=contain"
                    alt="Facebook"
                    width={60}
                    height={60}
                    className="w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] object-contain block"
                  />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="WhatsApp"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770149779669.png?width=200&height=200&resize=contain"
                    alt="WhatsApp"
                    width={60}
                    height={60}
                    className="w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] object-contain block"
                  />
                </a>

                {/* Email */}
                <a
                  href="mailto:contacto@disenare.com"
                  className="w-[56px] h-[56px] lg:w-[64px] lg:h-[64px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Correo"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-08-1770149787870.png?width=200&height=200&resize=contain"
                    alt="Email"
                    width={60}
                    height={60}
                    className="w-[52px] h-[52px] lg:w-[60px] lg:h-[60px] object-contain block"
                  />
                </a>
              </div>

              {/* Mobile: allow wrap if needed */}
              <div className="flex md:hidden flex-wrap items-center justify-center gap-[12px] mt-[12px]">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[48px] h-[48px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Instagram"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-06-1770149849866.png?width=200&height=200&resize=contain"
                    alt="Instagram"
                    width={44}
                    height={44}
                    className="w-[44px] h-[44px] object-contain block"
                  />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[48px] h-[48px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Facebook"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-09-1770149791022.png?width=200&height=200&resize=contain"
                    alt="Facebook"
                    width={44}
                    height={44}
                    className="w-[44px] h-[44px] object-contain block"
                  />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[48px] h-[48px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="WhatsApp"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770149779669.png?width=200&height=200&resize=contain"
                    alt="WhatsApp"
                    width={44}
                    height={44}
                    className="w-[44px] h-[44px] object-contain block"
                  />
                </a>

                {/* Email */}
                <a
                  href="mailto:contacto@disenare.com"
                  className="w-[48px] h-[48px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Correo"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-08-1770149787870.png?width=200&height=200&resize=contain"
                    alt="Email"
                    width={44}
                    height={44}
                    className="w-[44px] h-[44px] object-contain block"
                  />
                </a>
              </div>
            </div>

            {/* Column 3: Menú */}
            <div className="flex flex-col items-center md:items-end">
              <h3 className="font-['Montserrat'] text-[24px] md:text-[26px] lg:text-[28px] font-bold text-[#111111] leading-[1.1] mb-2 md:mb-3">
                Menú
              </h3>
              <nav className="flex flex-col items-center md:items-end gap-[6px] md:gap-[8px]">
                {menuLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-['Montserrat'] text-[16px] md:text-[18px] lg:text-[20px] font-normal text-[#111111] leading-[1.25] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-5 md:mt-6 lg:mt-7 text-center">
            <p className="font-['Montserrat'] text-[13px] md:text-[14px] lg:text-[15px] text-[#111111] italic">
              Diseñare Promocionales 2026®. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
