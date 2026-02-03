"use client";

import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] lg:h-[480px] xl:h-[520px] overflow-hidden bg-white">
      {/* Full banner image - using the provided reference as a single optimized image */}
      <Image
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/BANNER6-resized-1770139064806.jpg?width=8000&height=8000&resize=contain"
        alt="2drink es Tuyo - Botellas promocionales para hidratación"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
    </section>
  );
}
