"use client";

import Image from "next/image";

const menuLinks = [
  { label: "Categorías", href: "/categorias" },
  { label: "Productos", href: "/productos" },
  { label: "Nuevos", href: "/nuevos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#F5F5F5] pt-16 md:pt-20 lg:pt-[80px] pb-8 md:pb-10 lg:pb-10">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 items-start">
          {/* Column 1: Logo */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGOTIPO-1770138421366.png?width=8000&height=8000&resize=contain"
              alt="Diseñare Promocionales"
              width={220}
              height={100}
              className="h-[90px] md:h-[100px] lg:h-[110px] w-auto object-contain"
            />
          </div>

            {/* Column 2: Contáctanos */}
            <div className="flex flex-col items-center text-center">
              <h3 className="font-['Montserrat'] text-[26px] md:text-[28px] lg:text-[32px] font-semibold text-[#111111]">
                Contáctanos
              </h3>
              <div className="flex items-center justify-center gap-[14px] md:gap-[18px] lg:gap-[22px] mt-3 md:mt-4 lg:mt-5">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Instagram"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-06-1770149849866.png?width=200&height=200&resize=contain"
                    alt="Instagram"
                    width={48}
                    height={48}
                    className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] lg:w-[48px] lg:h-[48px] object-contain block"
                  />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Facebook"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-09-1770149791022.png?width=200&height=200&resize=contain"
                    alt="Facebook"
                    width={48}
                    height={48}
                    className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] lg:w-[48px] lg:h-[48px] object-contain block"
                  />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="WhatsApp"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770149779669.png?width=200&height=200&resize=contain"
                    alt="WhatsApp"
                    width={48}
                    height={48}
                    className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] lg:w-[48px] lg:h-[48px] object-contain block"
                  />
                </a>

                {/* Email */}
                <a
                  href="mailto:contacto@disenare.com"
                  className="flex items-center justify-center transition-all duration-[160ms] hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                  aria-label="Correo"
                >
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-08-1770149787870.png?width=200&height=200&resize=contain"
                    alt="Email"
                    width={48}
                    height={48}
                    className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] lg:w-[48px] lg:h-[48px] object-contain block"
                  />
                </a>
              </div>
            </div>

          {/* Column 3: Menú */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-['Montserrat'] text-[26px] md:text-[28px] lg:text-[32px] font-bold text-[#111111] mb-4 md:mb-5">
              Menú
            </h3>
            <nav className="flex flex-col items-center md:items-end gap-2 md:gap-[10px]">
              {menuLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-['Montserrat'] text-[20px] md:text-[22px] lg:text-[24px] font-normal text-[#111111] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 md:mt-16 lg:mt-20 text-center">
          <p className="font-['Montserrat'] text-[15px] md:text-[17px] lg:text-[18px] text-[#111111] italic">
            Diseñare Promocionales 2026®. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
