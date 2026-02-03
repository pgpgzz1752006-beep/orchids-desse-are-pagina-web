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
          <div className="flex flex-col items-center">
            <h3 className="font-['Montserrat'] text-[26px] md:text-[28px] lg:text-[32px] font-semibold text-[#111111] mb-5 md:mb-6">
              Contáctanos
            </h3>
            <div className="flex items-center gap-5 md:gap-6">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B7B3] transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="6" width="36" height="36" rx="10" />
                  <circle cx="24" cy="24" r="9" />
                  <circle cx="36" cy="12" r="2.5" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B7B3] transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
                  fill="currentColor"
                >
                  <path d="M44 24c0-11.046-8.954-20-20-20S4 12.954 4 24c0 9.983 7.314 18.257 16.875 19.757V30.094h-5.078V24h5.078v-4.648c0-5.014 2.986-7.785 7.558-7.785 2.19 0 4.48.39 4.48.39v4.922h-2.524c-2.486 0-3.261 1.543-3.261 3.125V24h5.547l-.887 6.094h-4.66v13.663C36.686 42.257 44 33.983 44 24z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00B7B3] transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                aria-label="WhatsApp"
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
                  fill="currentColor"
                >
                  <path d="M24 4C12.954 4 4 12.954 4 24c0 3.552.94 6.88 2.578 9.766L4 44l10.531-2.516A19.888 19.888 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4zm0 36c-3.195 0-6.18-.93-8.695-2.531l-.625-.375-6.469 1.547 1.578-6.25-.406-.656A15.874 15.874 0 018 24c0-8.836 7.164-16 16-16s16 7.164 16 16-7.164 16-16 16zm8.75-12.094c-.477-.238-2.82-1.39-3.258-1.55-.438-.16-.754-.238-.1.07.238-.316.715-1.551.875-1.551.16 0 .578.059 1.016.356 1.434.895 2.828 1.293 3.266 1.133.438-.16.359-.598.199-.836-.16-.238-.199-.398-.398-.637-.199-.238-.418-.168-.578-.109-.16.06-1.672.637-1.992.777-.32.14-.555.21-.797-.16-.242-.37-.937-1.175-1.18-1.414-.242-.238-.484-.168-.664-.109-.18.06-.777.297-.957.356-.18.06-.301.03-.421-.09-.12-.12-.48-.477-.6-.597-.12-.12-.24-.09-.36-.03-.12.06-.48.24-.6.3-.12.06-.18.09-.3.18-.12.09-.18.21-.12.39.06.18.84 2.28 1.02 2.64.18.36 1.32 2.16 3.3 3 1.26.54 1.74.6 2.34.48.36-.06 1.14-.48 1.32-.9.18-.42.18-.78.12-.9-.06-.12-.24-.18-.48-.3z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:contacto@disenare.com"
                className="text-[#00B7B3] transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50 rounded"
                aria-label="Correo"
              >
                <svg
                  viewBox="0 0 48 48"
                  className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="8" width="40" height="32" rx="4" />
                  <polyline points="4,12 24,28 44,12" />
                </svg>
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
