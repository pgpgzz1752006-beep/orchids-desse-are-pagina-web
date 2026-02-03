"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  name: string;
  image: string;
  href: string;
}

interface ProductStripProps {
  titleRegular: string;
  titleBold: string;
  products: Product[];
}

export default function ProductStrip({ titleRegular, titleBold, products }: ProductStripProps) {
  return (
    <section className="w-full bg-white py-14 md:py-16 lg:py-[72px]">
      <div className="w-full max-w-[1320px] mx-auto px-6 md:px-10 lg:px-10">
        {/* Title */}
        <h2 className="text-center font-['Montserrat'] text-[28px] md:text-[36px] lg:text-[42px] tracking-[0.02em] text-[#111111] mb-10 md:mb-12">
          <span className="font-normal">{titleRegular} </span>
          <span className="font-extrabold">{titleBold}</span>
        </h2>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button
            className="hidden md:flex absolute left-0 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] transition-colors duration-180 cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>

          {/* Products Grid */}
          <div className="w-full md:px-14 lg:px-16 overflow-x-auto scrollbar-hide">
            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 min-w-max md:min-w-0">
              {products.map((product) => (
                <a
                  key={product.name}
                  href={product.href}
                  className="flex-shrink-0 w-[180px] md:w-auto bg-white border border-[#D9D9D9] rounded-[11px] p-3 lg:p-[14px] flex flex-col transition-all duration-180 ease-out hover:border-[#BBBBBB] hover:-translate-y-[2px] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14C6C9]/40"
                >
                  {/* Image Container */}
                  <div className="flex items-center justify-center h-[100px] md:h-[110px] lg:h-[120px] mb-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="max-h-[90px] md:max-h-[100px] lg:max-h-[110px] w-auto object-contain"
                    />
                  </div>

                  {/* Product Name */}
                  <p className="font-['Montserrat'] text-[10px] md:text-[11px] lg:text-[11px] font-medium text-[#333333] text-center uppercase leading-[1.4] min-h-[28px]">
                    {product.name}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="hidden md:flex absolute right-0 z-10 w-11 h-11 items-center justify-center text-[#777777] hover:text-[#333333] transition-colors duration-180 cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </div>

        {/* Dots (decorative only) */}
        <div className="flex justify-center gap-2 mt-8">
          <span className="w-2 h-2 rounded-full bg-[#333333]" />
          <span className="w-2 h-2 rounded-full bg-[#D9D9D9]" />
          <span className="w-2 h-2 rounded-full bg-[#D9D9D9]" />
        </div>
      </div>
    </section>
  );
}
