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
    <section className="relative w-full min-h-[180px] md:min-h-[200px] lg:min-h-[220px] bg-white dark:bg-[#0E0F12] overflow-hidden transition-colors duration-300">
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
