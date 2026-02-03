"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-6 z-[9999] w-[64px] h-[64px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] rounded-full bg-[#25D366] flex items-center justify-center cursor-pointer shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 motion-reduce:hover:transform-none"
      aria-label="Abrir WhatsApp"
    >
      {/* White backplate for contrast */}
      <div className="w-[50px] h-[50px] md:w-[62px] md:h-[62px] lg:w-[70px] lg:h-[70px] rounded-full bg-white flex items-center justify-center">
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-07-1770154790463.png?width=200&height=200&resize=contain"
          alt="WhatsApp"
          className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[56px] lg:h-[56px] object-contain block"
        />
      </div>
    </a>
  );
}
