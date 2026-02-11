import Image from "next/image";

const categorias = [
  {
    title: "AGENDAS",
    subcategories: ["DIARIA", "SEMANAL"],
    image: "/antiestres.jpg",
    bgColor: "bg-orange-100",
    barColor: "bg-pink-600",
  },
  {
    title: "ANTIESTRES",
    subcategories: ["FIGURAS ANTIESTRES"],
    image: "/antiestres.jpg",
    bgColor: "bg-sky-200",
    barColor: "bg-[#FFE600]",
  },
  {
    title: "ARTÍCULOS PARA VIAJE",
    subcategories: [
      "ACCESORIOS PARA VIAJE",
      "CANGURERA Y MOCHILA DE VIAJE",
      "LENTES",
      "ORGANIZADORES",
      "PORTA DOCUMENTOS",
      "NECESER",
    ],
    image: "/antiestres.jpg",
    bgColor: "bg-amber-100",
    barColor: "bg-purple-700",
  },
];

export default function CategoriasPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0E0F12] text-[#111111] dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <div
              key={cat.title}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex h-full">
                <div className={`w-2/5 relative aspect-square ${cat.bgColor}`}>
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <h3 className="font-['Montserrat'] font-bold text-sm md:text-base">
                    {cat.title}
                  </h3>
                  <div className="mt-1 space-y-0.5">
                    {cat.subcategories.map((sub) => (
                      <p
                        key={sub}
                        className="text-xs text-[#7A7A7A] dark:text-gray-400"
                      >
                        {sub}
                      </p>
                    ))}
                  </div>
                </div>
                <div className={`w-5 ${cat.barColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
