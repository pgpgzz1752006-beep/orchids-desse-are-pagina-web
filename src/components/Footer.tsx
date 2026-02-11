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
      <div className="w-full flex h-[3px]">
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
            {/* Logo - absolute so it doesn't affect centering */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hidden md:block absolute left-3 md:left-8 lg:left-[48px] top-6 md:top-7 lg:top-[26px] h-[75px] w-[170px] md:h-[110px] md:w-[260px] lg:h-[190px] lg:w-[420px] overflow-visible cursor-pointer z-10"
              aria-label="Ir al inicio"
            >
              <Image
                src="/brand/logo-light.webp"
                alt="Diseñare Promocionales"
                width={420}
                height={200}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-auto object-contain object-left-center block dark:hidden transition-opacity duration-[180ms] ease-in-out"
              />
              <Image
                src="/brand/logo-dark.webp"
                alt="Diseñare Promocionales"
                width={420}
                height={200}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-auto object-contain object-left-center hidden dark:block transition-opacity duration-[180ms] ease-in-out"
              />
            </a>

            {/* Mobile Logo */}
            <div className="flex justify-center md:hidden">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="relative h-[75px] w-[170px] overflow-visible block cursor-pointer"
                aria-label="Ir al inicio"
              >
                <Image
                  src="/brand/logo-light.webp"
                  alt="Diseñare Promocionales"
                  width={420}
                  height={200}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-auto object-contain object-left-center block dark:hidden transition-opacity duration-[180ms] ease-in-out"
                />
                <Image
                  src="/brand/logo-dark.webp"
                  alt="Diseñare Promocionales"
                  width={420}
                  height={200}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-auto object-contain object-left-center hidden dark:block transition-opacity duration-[180ms] ease-in-out"
                />
              </a>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 lg:gap-6 items-start md:max-w-[70%] md:mx-auto">

            {/* Column 2: Contáctanos */}
              <div id="contacto" className="flex flex-col items-center justify-start text-center scroll-mt-[110px] md:scroll-mt-[140px] lg:scroll-mt-[240px]">
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
                        src="/icons/icon-instagram.png"
                        alt="Instagram"
                        width={122}
                        height={122}
                        className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                        src="/icons/icon-facebook.png"
                        alt="Facebook"
                        width={122}
                        height={122}
                        className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                        src="/icons/icon-whatsapp.png"
                        alt="WhatsApp"
                        width={122}
                        height={122}
                        className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:disenarepromocionales@gmail.com?subject=Cotizaci%C3%B3n%20de%20promocionales&body=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20promocionales.%20Mi%20nombre%20es%3A%20_____%20%0A%0AGracias."
                    className="p-0 m-0 -ml-[10px] lg:-ml-[14px] flex-shrink-0 flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                    aria-label="Enviar correo a disenarepromocionales@gmail.com"
                  >
                    <img
                        src="/icons/icon-email.png"
                        alt="Email"
                        width={122}
                        height={122}
                        className="w-[96px] h-[96px] lg:w-[122px] lg:h-[122px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                        src="/icons/icon-instagram.png"
                        alt="Instagram"
                        width={70}
                        height={70}
                        className="w-[70px] h-[70px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                        src="/icons/icon-facebook.png"
                        alt="Facebook"
                        width={70}
                        height={70}
                        className="w-[70px] h-[70px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                          src="/icons/icon-whatsapp.png"
                          alt="WhatsApp"
                          width={70}
                          height={70}
                          className="w-[70px] h-[70px] object-contain block"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </a>

                    {/* Email */}
                    <a
                      href="mailto:disenarepromocionales@gmail.com?subject=Cotizaci%C3%B3n%20de%20promocionales&body=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20promocionales.%20Mi%20nombre%20es%3A%20_____%20%0A%0AGracias."
                      className="p-0 m-0 -ml-[8px] flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                      aria-label="Enviar correo a disenarepromocionales@gmail.com"
                    >
                      <img
                        src="/icons/icon-email.png"
                        alt="Email"
                        width={70}
                        height={70}
                        className="w-[70px] h-[70px] object-contain block"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </a>
                  </div>
            </div>

              {/* Column 3: Menú */}
              <div className="flex flex-col items-center md:items-end gap-2">
                <h3 className="font-['Montserrat'] text-[24px] md:text-[26px] lg:text-[28px] font-semibold text-[#111111] dark:text-[#F2F2F2] leading-[1.1]">
                  Menú
                </h3>
                <nav className="flex flex-col items-center md:items-end gap-1">
                  {menuLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="font-['Montserrat'] text-[13px] md:text-[14px] lg:text-[15px] text-[#444] dark:text-[#ccc] hover:text-[#111] dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
          </div>

            {/* Copyright - aligned with center column */}
            <div className="mt-5 md:mt-6 lg:mt-7 grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr]">
              <div className="hidden md:block" />
              <p className="font-['Montserrat'] text-[13px] md:text-[14px] lg:text-[15px] text-[#111111] dark:text-[#F2F2F2] italic text-center">
                Diseñare Promocionales 2026®. Todos los derechos reservados.
              </p>
              <div className="hidden md:block" />
            </div>
        </div>
      </div>
    </footer>
  );
}
