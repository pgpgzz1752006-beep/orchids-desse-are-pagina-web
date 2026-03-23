"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    label: "Bebidas y termos",
    href: "/productos?category=bebidas",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/TMPS-217-RG_7-1770139822312.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(107, 43, 131, 0.78)",
  },
  {
    label: "Bolsas y maletas",
    href: "/productos?category=bolsas",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SIN-761-G_8-1770139575048.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(182, 167, 0, 0.78)",
  },
  {
    label: "Libretas y carpetas",
    href: "/productos?category=libretas",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/HL-9046-H_7-1770139580279.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(216, 27, 125, 0.78)",
  },
  {
    label: "Bar",
    href: "/productos?category=bar",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/KTC-850-BE_5-1770139578681.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(31, 106, 174, 0.78)",
  },
  {
    label: "Sets de regalo",
    href: "/productos?category=sets-regalo",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SET-023-N_6-1770139576900.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(34, 167, 214, 0.78)",
  },
  {
    label: "Deportes",
    href: "/productos?category=deportes",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-750-D_7-1770139573383.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(107, 43, 131, 0.78)",
  },
  {
    label: "Artículos del hogar",
    href: "/productos?category=hogar",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/KTC-850-BE_5-1770139578681.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(122, 174, 43, 0.78)",
  },
  {
    label: "Textiles",
    href: "/productos?category=textiles",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/CAP-021-AC_3-1770139581820.jpg?width=800&height=800&resize=contain",
    overlayColor: "rgba(210, 138, 27, 0.78)",
  },
];

export default function CategoriesSection() {
  return (
    <section className="w-full bg-white dark:bg-[#0E0F12] py-4 md:py-16 lg:py-[72px] transition-colors duration-300 ease-in-out">
      {/* Title */}
      <div className="w-full max-w-[1440px] mx-auto px-4 mb-4 md:mb-10 lg:mb-12">
        <h2 className="text-center font-['Montserrat'] text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-[#111111] dark:text-[#F2F2F2]">
          <span className="font-normal">CATEGORÍAS </span>
          <span className="font-extrabold">DESTACADAS</span>
        </h2>
      </div>

      {/* Categories Grid — full width, minimal padding */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {categories.map((category, index) => (
            <Link
              key={category.label}
              href={category.href}
              className="group relative h-[260px] md:h-[300px] lg:h-[320px] overflow-hidden block will-change-transform transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] hover:z-10 active:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/60 focus-visible:ring-offset-2 motion-reduce:hover:transform-none motion-reduce:hover:shadow-md"
            >
              {/* Background Image */}
              <Image
                src={category.image}
                alt={category.label}
                fill
                className="object-cover transition-transform duration-[260ms] ease-out group-hover:scale-[1.06]"
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                loading={index < 4 ? "eager" : "lazy"}
              />

              {/* Color Overlay at Bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[56px] md:h-[60px] lg:h-[64px] flex items-center justify-center transition-opacity duration-200 ease-out group-hover:opacity-90"
                style={{ backgroundColor: category.overlayColor }}
              >
                <span className="font-['Montserrat'] text-white text-[18px] md:text-[22px] lg:text-[24px] font-semibold text-center px-4">
                  {category.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
