import Image from "next/image";

const categorias = [
  {
    title: "AGENDAS",
    subcategories: ["DIARIA", "SEMANAL"],
    image: "/antiestres.jpg",
    barColor: "bg-[#E00273]",
  },
  {
    title: "ANTIESTRES",
    subcategories: ["FIGURAS ANTIESTRES"],
    image: "/antiestres.jpg",
    barColor: "bg-[#F3E610]",
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
    barColor: "bg-[#462681]",
  },
  {
    title: "BAR",
    subcategories: ["ARTÍCULOS PARA BAR", "DESTAPADORES", "LICORERAS", "SACA CORCHOS", "SET Y ESTUCHES"],
    image: "/antiestres.jpg",
    barColor: "bg-[#009EE2]",  
  },
  {
    title: "BEBIDAS",
    subcategories: ["ARTICULOS PARA CAFÉ", "CILINDROS DE PLASTICO", "CILINDROS DE VIDRIO", "CILINDROS METÁLICOS", "TAZAS", "TERMO DE PLASTICO", "TERMO METALICO", "VASOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#762281]",
  },
  {
    title: "BELLEZA",
    subcategories: ["ARTICULOS PARA DAMA", "BROCHAS Y MAQUILLAJE", "COSMETIQUERAS", "COSTUREROS", "ESPEJOS", "JOYERIA", "MANICURE", "SETS DE BELLEZA"],
    image: "/antiestres.jpg",
    barColor: "bg-[#93C01F]",
    },
    {
      title: "BOLSAS",
      subcategories: ["BOLSA MOCHILA", "BOLSAS ECOLOGICAS", "BOLSAS REUTILIZABLES", "BOLSAS CASUALES"],
      image: "/antiestres.jpg",
      barColor: "bg-[#1BAFA6]",
  },
  {
    title: "COMPLEMENTOS",
    subcategories: ["ACCESORIOS Y COMPLEMENTOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#F6931D]",
  },
  {
    title: "DEPORTES",
    subcategories: ["ARTICULOS DEPORTIVOS", "FÚTBOL"],
    image: "/antiestres.jpg",
    barColor: "bg-[#1A237E]",
  },
  {
    title: "ENTRETENIMIENTO",
    subcategories: ["JUEGOS", "SETS DE ENTRETENIMIENTO"],
    image: "/antiestres.jpg",
    barColor: "bg-[#BDBDBD]",
  },
  {
    title: "ESCRITURA",
    subcategories: ["BOLIGRAFOS ECOLOGICOS", "BOLIGRAFOS FUNCIONES", "BOLIGRAFOS METALICOS", "BOLIGRAFOS PLASTICOS", "SETS DE BOLIGRAFOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#9C27B0]",
  },
  {
    title: "HERRAMIENTAS",
    subcategories: ["AUTOMOVIL", "LAMPARAS", "NAVAJAS", "SET DE HERRAMIENTAS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#FFE600]",
  },
  {
    title: "HIELERAS Y PORTAVIANDAS",
    subcategories: ["MOCHILA - HIELERA", "HIELERAS Y LONCHERAS", "PORTAVIANDAS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#BDBDBD]",
  },
  {
    title: "HOGAR",
    subcategories: ["BBQ", "CESTOS", "COCINA", "DECORACION", "JARDINERÍA", "MANDILES", "MASCOTAS", "TABLAS Y SETS DE QUESOS"],
    image: "/antiestres.jpg",
    barColor: "bg-[#FF9800]",
  },
    {
      title: "LIBRETAS Y CARPETAS",
      subcategories: ["LIBRETAS EJECUTIVAS", "LIBRETAS ECOLOGICAS", "SETS DE LIBRETAS", "CARPETAS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#00BCD4]",
    },
    {
      title: "PORTAFOLIOS",
      subcategories: ["PORTAFOLIOS Y PORTALAPTOPS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#26A69A]",
    },
    {
      title: "MOCHILAS",
      subcategories: ["MOCHILAS", "MALETAS Y PORTAFOLIOS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#4A1E8B]",
    },
    {
      title: "OFICINA",
      subcategories: ["ACCESORIOS DE ESCRITORIO", "CLIPS Y SACAPUNTAS", "MOUSE PAD", "ORGANIZADORES DE ESCRITORIO", "PORTA TARJETAS", "REGLAS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#FFE600]",
    },
    {
      title: "PARAGUAS",
      subcategories: ["PARAGUAS AUTOMATICOS", "PARAGUAS MANUALES", "SOMBRILLAS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#8BC34A]",
    },
    {
      title: "SALUD",
      subcategories: ["CUIDADO PERSONAL", "GELES Y SANITIZANTES", "PASTILLEROS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#2196F3]",
    },
    {
      title: "SETS DE REGALO",
      subcategories: ["SETS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#1A237E]",
    },
    {
      title: "TECNOLOGÍA",
      subcategories: ["CABLES Y CARGADORES", "ACCESORIOS DE COMPUTO", "ACCESORIOS PARA SMARTPHONE Y TABLET", "AUDÍFONOS", "BASES Y SOPORTES", "BOCINAS", "POWER BANKS", "SETS TECNOLOGIA", "USB"],
      image: "/antiestres.jpg",
      barColor: "bg-[#4A1E8B]",
    },
    {
      title: "TEXTILES",
      subcategories: ["CHAMARRAS Y CHALECOS", "GORRAS Y SOMBREROS", "PLAYERAS"],
      image: "/antiestres.jpg",
      barColor: "bg-[#E91E63]",
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
                className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-52"
              >
                <div className="flex h-full">
                  <div className="w-2/5 relative bg-gray-100 dark:bg-white/5">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                    <div className="flex-1 p-3 flex flex-col justify-start overflow-hidden">
                      <h3 className="font-['Montserrat'] font-bold text-xs md:text-sm">
                        {cat.title}
                      </h3>
                      <div className="mt-1 space-y-0 overflow-hidden">
                        {cat.subcategories.map((sub) => (
                          <p
                            key={sub}
                            className="text-xs leading-snug text-[#7A7A7A] dark:text-gray-400"
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
