"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingCart, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useCartStore } from "@/lib/cartStore";
import { useAuth } from "./AuthProvider";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/productos?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full bg-white dark:bg-[#0E0F12]">
      {/* Multicolor Top Bar */}
      <div className="flex w-full h-[10px]">
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

      {/* Main Header - 3 Column Grid */}
      <div className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-x-6 h-[56px] md:h-[110px] lg:h-[190px] pl-3 pr-4 md:pl-4 md:pr-6 lg:pl-4 lg:pr-6">
        {/* Column 1: Logo - flush left */}
        <div className="justify-self-start flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center">
                <Image
                  src="/brand/logo-light.webp"
                  alt="Diseñare Promocionales"
                  width={420}
                  height={200}
                  className="h-[60px] md:h-[90px] lg:h-[180px] w-auto object-contain block dark:hidden transition-opacity duration-[180ms] ease-in-out"
                  priority
                />
                <Image
                  src="/brand/logo-dark.webp"
                  alt="Diseñare Promocionales"
                  width={420}
                  height={200}
                  className="h-[60px] md:h-[90px] lg:h-[180px] w-auto object-contain hidden dark:block transition-opacity duration-[180ms] ease-in-out"
                  priority
                />
            </a>
        </div>

        {/* Column 2: Desktop Navigation - centered */}
        <nav className="hidden lg:flex items-center justify-self-center min-w-0 max-w-[820px] w-full justify-center gap-5 xl:gap-9 2xl:gap-14 overflow-visible flex-nowrap mr-8">
          {navItems.map((item) => (
              item.href.startsWith("#") ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.href.slice(1));
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group relative whitespace-nowrap flex-shrink-0 overflow-visible"
                >
                  <span className={`font-['Montserrat'] text-[15px] xl:text-[18px] 2xl:text-[22px] font-medium uppercase tracking-[0.04em] transition-colors duration-200 ease-out ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white group-hover:text-[#14C6C9]"}`}>
                    {item.label}
                  </span>
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#14C6C9] transform scale-x-0 origin-left transition-transform duration-200 ease-out group-hover:scale-x-100" />
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative whitespace-nowrap flex-shrink-0 overflow-visible"
                >
                  <span className={`font-['Montserrat'] text-[15px] xl:text-[18px] 2xl:text-[22px] font-medium uppercase tracking-[0.04em] transition-colors duration-200 ease-out ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white group-hover:text-[#14C6C9]"}`}>
                    {item.label}
                  </span>
                  {item.active && <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#14C6C9] transform scale-x-100 origin-center animate-underline-grow" />}
                  {!item.active && <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#14C6C9] transform scale-x-0 origin-left transition-transform duration-200 ease-out group-hover:scale-x-100" />}
                </Link>
              )
            ))}
        </nav>

        {/* Column 3: Action Icons - flush right */}
        <div className="flex items-center justify-self-end flex-shrink-0 min-w-0 md:min-w-[180px] justify-end gap-1 md:gap-3 lg:gap-4 xl:gap-5 pr-1 lg:pr-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] dark:hover:text-white hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/30 rounded"
            aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
              {theme === "light" ? (
                <Moon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
              ) : (
                <Sun className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
              )}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 md:p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
            </button>
            <a
              href={user ? "/cuenta" : "/login"}
              className={`relative p-1.5 md:p-2 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded ${
                user ? "text-[#14C6C9]" : "text-[#7A7A7A] hover:text-[#111111] dark:hover:text-white"
              }`}
              aria-label="Mi cuenta"
            >
              <User className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-[10px] h-[10px] rounded-full bg-[#7BC043] border-2 border-white dark:border-[#0E0F12]" />
              )}
            </a>
              <a
                href="/carrito"
                className="relative p-1.5 md:p-2 text-[#7A7A7A] transition-all duration-200 ease-out hover:text-[#111111] dark:hover:text-white hover:-translate-y-[1px] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/30 rounded"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#14C6C9] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
            </a>

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
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group relative"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      e.preventDefault();
                      setTimeout(() => {
                        const target = document.getElementById(item.href.slice(1));
                        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                  >
                    <span className={`font-['Montserrat'] text-[20px] font-medium uppercase tracking-[0.04em] transition-colors duration-200 ease-out ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white hover:text-[#14C6C9]"}`}>
                      {item.label}
                    </span>
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group relative"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={`font-['Montserrat'] text-[20px] font-medium uppercase tracking-[0.04em] transition-colors duration-200 ease-out ${item.active ? "text-[#14C6C9]" : "text-[#111111] dark:text-white hover:text-[#14C6C9]"}`}>
                      {item.label}
                    </span>
                    {item.active && <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#14C6C9]" />}
                  </Link>
                )
              ))}
          </nav>
        </div>
      )}
      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-2xl mt-16 md:mt-24 mx-4 bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 md:p-5">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-[#7A7A7A] flex-shrink-0" strokeWidth={1.5} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent font-['Montserrat'] text-base md:text-lg text-[#111111] dark:text-white placeholder:text-[#AAAAAA] outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-[#7A7A7A] hover:text-[#111111] dark:hover:text-white transition-colors rounded"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </form>
            {searchQuery.trim() && (
              <div className="border-t border-gray-100 dark:border-white/10 px-4 pb-4 pt-2">
                <button
                  onClick={handleSearch}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <Search className="w-4 h-4 text-[#14C6C9]" strokeWidth={2} />
                  <span className="font-['Montserrat'] text-sm text-[#111111] dark:text-white">
                    Buscar <strong>&quot;{searchQuery.trim()}&quot;</strong> en productos
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
