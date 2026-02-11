import Image from "next/image";

const categorias = [
  {
    title: "AGENDAS",
    subcategories: ["DIARIA", "SEMANAL"],
    image: "/antiestres.jpg",
    barColor: "bg-pink-600",
  },
  {
    title: "ANTIESTRES",
    subcategories: ["FIGURAS ANTIESTRES"],
    image: "/antiestres.jpg",
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
    barColor: "bg-[#4A1E8B]",
  },
  {
    title: "BAR",
    subcategories: ["ARTÍCULOS PARA BAR", "DESTAPADORES", "LICORERAS", "SACA CORCHOS", "SET Y ESTUCHES"],
    image: "/antiestres.jpg",
    barColor: "bg-[#8BC34A]",
  },
  {
    title: "BEBIDAS",
    subcategories: ["ARTICULOS PARA CAFÉ", "CILINDROS DE PLASTICO", "CILINDROS DE VIDRIO", "CILINDROS METÁLICOS", "TAZAS", "TERMO DE PLASTICO", "TERMO METALICO", "VASOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#2196F3]",
  },
  {
    title: "BELLEZA",
    subcategories: ["ARTICULOS PARA DAMA", "BROCHAS Y MAQUILLAJE", "COSMETIQUERAS", "COSTUREROS", "ESPEJOS", "JOYERIA", "MANICURE", "SETS DE BELLEZA"],
    image: "/antiestres.jpg",
    barColor: "bg-[#7B1FA2]",
  },
  {
    title: "BOLSAS",
    subcategories: ["BOLSA MOCHILA", "BOLSAS ECOLOGICAS", "BOLSAS REUTILIZABLES", "BOLSAS CASUALES"],
    image: "/antiestres.jpg",
    barColor: "bg-[#26A69A]",
  },
  {
    title: "COMPLEMENTOS",
    subcategories: ["ACCESORIOS Y COMPLEMENTOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#FF9800]",
  },
  {
    title: "DEPORTES",
    subcategories: ["ARTICULOS DEPORTIVOS", "FÚTBOL"],
    image: "/antiestres.jpg",
    barColor: "bg-[#1A237E]",
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
                <div className="w-2/5 relative aspect-square bg-gray-100 dark:bg-white/5">
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
