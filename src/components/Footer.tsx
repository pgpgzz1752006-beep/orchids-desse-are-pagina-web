"use client";

import Image from "next/image";

const menuLinks = [
  { label: "Categorías", href: "/categorias" },
  { label: "Productos", href: "/productos" },
  { label: "Nuevos", href: "/nuevos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "#contacto" },
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
    <footer className="w-full bg-white dark:bg-[#0E0F12] transition-colors duration-300">
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
      <div className="w-full bg-[#F5F5F5] dark:bg-[#12141A] pt-6 md:pt-7 lg:pt-[26px] pb-5 md:pb-6 lg:pb-6 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-3 md:px-8 lg:px-[48px]">
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr] gap-6 md:gap-4 lg:gap-6 items-start">
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
              <div id="contacto" className="flex flex-col items-center justify-start text-center scroll-mt-[140px]">
              <h3 className="font-['Montserrat'] text-[24px] md:text-[26px] lg:text-[28px] font-semibold text-[#111111] dark:text-[#F2F2F2] leading-[1.1]">
                Contáctanos
              </h3>
                {/* Desktop/Tablet: single row, no wrap, negative margins to compress */}
                <div className="hidden md:flex flex-nowrap items-center justify-center mt-[12px] md:mt-[14px] lg:mt-[16px]">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/disenare.promocionales?igsh=MWEwb2htdm80bG9yNA%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0 m-0 flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Instagram Diseñare Promocionales"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-06-1770149849866.png?width=200&height=200&resize=contain"
                      alt="Instagram"
                      width={122}
                      height={122}
                      className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                    />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/14UPMcQd31J/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0 m-0 -ml-[10px] lg:-ml-[14px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Facebook Diseñare Promocionales"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-09-1770149791022.png?width=200&height=200&resize=contain"
                      alt="Facebook"
                      width={122}
                      height={122}
                      className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                    />
                  </a>

                  {/* WhatsApp */}
                    <a
                      href="https://wa.me/529512424333"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0 m-0 -ml-[10px] lg:-ml-[14px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                      aria-label="Abrir WhatsApp +52 951 242 4333"
                    >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770149779669.png?width=200&height=200&resize=contain"
                      alt="WhatsApp"
                      width={122}
                      height={122}
                      className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                    />
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:disenarepromocionales@gmail.com?subject=Cotizaci%C3%B3n%20de%20promocionales&body=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20promocionales.%20Mi%20nombre%20es%3A%20_____%20%0A%0AGracias."
                    className="p-0 m-0 -ml-[10px] lg:-ml-[14px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Enviar correo a disenarepromocionales@gmail.com"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-08-1770149787870.png?width=200&height=200&resize=contain"
                      alt="Email"
                      width={122}
                      height={122}
                      className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                    />
                  </a>
                </div>

                {/* Mobile: allow wrap if needed */}
                <div className="flex md:hidden flex-wrap items-center justify-center mt-[12px]">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/disenare.promocionales?igsh=MWEwb2htdm80bG9yNA%3D%3D&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0 m-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Instagram Diseñare Promocionales"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-06-1770149849866.png?width=200&height=200&resize=contain"
                      alt="Instagram"
                      width={70}
                      height={70}
                      className="w-[70px] h-[70px] object-contain block"
                    />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/share/14UPMcQd31J/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0 m-0 -ml-[8px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Facebook Diseñare Promocionales"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-09-1770149791022.png?width=200&height=200&resize=contain"
                      alt="Facebook"
                      width={70}
                      height={70}
                      className="w-[70px] h-[70px] object-contain block"
                    />
                  </a>

                  {/* WhatsApp */}
                    <a
                      href="https://wa.me/529512424333"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0 m-0 -ml-[8px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                      aria-label="Abrir WhatsApp +52 951 242 4333"
                    >
                      <img
                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770149779669.png?width=200&height=200&resize=contain"
                        alt="WhatsApp"
                        width={70}
                        height={70}
                        className="w-[70px] h-[70px] object-contain block"
                      />
                    </a>

                  {/* Email */}
                  <a
                    href="mailto:disenarepromocionales@gmail.com?subject=Cotizaci%C3%B3n%20de%20promocionales&body=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20promocionales.%20Mi%20nombre%20es%3A%20_____%20%0A%0AGracias."
                    className="p-0 m-0 -ml-[8px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Enviar correo a disenarepromocionales@gmail.com"
                  >
                    <img
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-08-1770149787870.png?width=200&height=200&resize=contain"
                      alt="Email"
                      width={70}
                      height={70}
                      className="w-[70px] h-[70px] object-contain block"
                    />
                  </a>
                </div>
            </div>

              {/* Column 3: Menú */}
              <div className="flex flex-col items-center md:items-end">
                <h3 className="font-['Montserrat'] text-[24px] md:text-[26px] lg:text-[28px] font-bold text-[#111111] dark:text-[#F2F2F2] leading-[1.1] mb-2 md:mb-3">
                  Menú
                </h3>
                <nav className="flex flex-col items-center md:items-end gap-[6px] md:gap-[8px]">
                  {menuLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="group relative inline-block font-['Montserrat'] text-[16px] md:text-[18px] lg:text-[20px] font-normal text-[#111111] dark:text-[#F2F2F2] leading-[1.25] transition-colors duration-200 ease-out hover:text-[#14C6C9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/45 focus-visible:ring-offset-4 rounded-md"
                    >
                      {link.label}
                      {/* Animated underline */}
                      <span className="absolute -bottom-[3px] left-0 w-full h-[2px] bg-[#14C6C9] rounded-full transform scale-x-0 origin-left transition-transform duration-200 ease-out group-hover:scale-x-100" />
                    </a>
                  ))}
                </nav>
              </div>
          </div>

          {/* Copyright */}
          <div className="mt-5 md:mt-6 lg:mt-7 text-center">
            <p className="font-['Montserrat'] text-[13px] md:text-[14px] lg:text-[15px] text-[#111111] dark:text-[#F2F2F2] italic">
              Diseñare Promocionales 2026®. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
