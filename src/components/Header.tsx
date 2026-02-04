"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, User, ShoppingCart, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { label: "CATEGORÍAS", href: "/categorias", active: false },
  { label: "PRODUCTOS", href: "/productos", active: false },
  { label: "NUEVOS", href: "/nuevos", active: false },
  { label: "SERVICIOS", href: "/servicios", active: false },
  { label: "CONTACTO", href: "#contacto", active: false },
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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#0E0F12] transition-colors duration-300">
      {/* Multicolor Top Bar */}
      <div className="flex w-full h-[12px]">
        {colorBarSegments.map((segment, index) => (
          <div
            key={index}
            style={{
              backgroundColor: segment.color,
              width: segment.width,
            }}
          />
        ))}
      </div>

        {/* Main Header */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-[100px] md:h-[110px] lg:h-[120px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="block">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGOTIPO-1770138421366.png?width=8000&height=8000&resize=contain"
                alt="Diseñare Promocionales"
                width={240}
                height={100}
                className="h-[58px] w-auto object-contain md:h-[78px] lg:h-[95px]"
                priority
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-14 xl:gap-16">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith("#")) {
                      e.preventDefault();
                      const target = document.getElementById(item.href.slice(1));
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }
                  }}
                  className="group relative"
                >
                <span
                    className={`
                      font-['Montserrat'] text-[18px] font-medium uppercase tracking-[0.04em]
                      transition-colors duration-200 ease-out
                      ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white group-hover:text-[#14C6C9]"}
                    `}
                  >
                    {item.label}
                  </span>
                {/* Active underline */}
                {item.active && (
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#14C6C9] transform scale-x-100 origin-center animate-underline-grow" />
                )}
                {/* Hover underline for inactive items */}
                {!item.active && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#14C6C9] transform scale-x-0 origin-left transition-transform duration-200 ease-out group-hover:scale-x-100" />
                )}
              </a>
            ))}
        </nav>

          {/* Icons */}
          <div className="flex items-center gap-7 lg:gap-8">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] dark:hover:text-white hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/30 rounded"
              aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Sun className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
            <button
              className="p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
              aria-label="Buscar"
            >
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <button
            className="p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
            aria-label="Mi cuenta"
          >
            <User className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <button
            className="p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[132px] bg-white dark:bg-[#0E0F12] z-40 transition-colors duration-300">
            <nav className="flex flex-col items-center pt-12 gap-8">
              {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group relative"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (item.href.startsWith("#")) {
                        e.preventDefault();
                        setTimeout(() => {
                          const target = document.getElementById(item.href.slice(1));
                          if (target) {
                            target.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }, 100);
                      }
                    }}
                  >
                  <span
                      className={`
                        font-['Montserrat'] text-[20px] font-medium uppercase tracking-[0.04em]
                        transition-colors duration-200 ease-out
                        ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white hover:text-[#14C6C9]"}
                      `}
                    >
                      {item.label}
                    </span>
                  {item.active && (
                    <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#14C6C9]" />
                  )}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
  );
}
