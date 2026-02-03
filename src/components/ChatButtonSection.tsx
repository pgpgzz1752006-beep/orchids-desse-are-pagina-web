"use client";

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

export default function ChatButtonSection() {
  return (
    <section className="relative w-full min-h-[180px] md:min-h-[200px] lg:min-h-[220px] bg-white overflow-hidden">
      {/* Chat Button */}
      <button
        className="absolute top-7 right-7 md:top-8 md:right-10 lg:top-10 lg:right-11 z-20 w-[70px] h-[70px] md:w-[96px] md:h-[96px] lg:w-[110px] lg:h-[110px] rounded-full bg-[#00B7B3] flex items-center justify-center cursor-pointer transition-all duration-180 ease-out hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B7B3]/50"
        aria-label="Abrir chat"
      >
        {/* Chat Icon SVG */}
        <svg
          viewBox="0 0 64 64"
          className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] lg:w-[56px] lg:h-[56px]"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Chat bubble */}
          <path d="M12 14 C12 10, 16 8, 20 8 L44 8 C48 8, 52 10, 52 14 L52 36 C52 40, 48 42, 44 42 L24 42 L16 52 L16 42 L20 42 C16 42, 12 40, 12 36 Z" />
          {/* Three lines inside */}
          <line x1="22" y1="20" x2="42" y2="20" />
          <line x1="22" y1="28" x2="38" y2="28" />
          <line x1="22" y1="36" x2="34" y2="36" />
        </svg>
      </button>

      {/* Multicolor Bar */}
      <div className="absolute left-0 right-0 bottom-0 h-[10px] md:h-[11px] lg:h-[12px] flex z-10">
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
    </section>
  );
}
