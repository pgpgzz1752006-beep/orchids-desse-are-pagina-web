import Image from "next/image";
import Footer from "@/components/Footer";

const categorias = [
  {
    title: "AGENDAS",
    subcategories: ["DIARIA", "SEMANAL"],
    image: "/cat-agendas.jpg",
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
      image: "/cat-viaje.jpg",
      barColor: "bg-[#462681]",
    },
    {
      title: "BAR",
    subcategories: ["ARTÍCULOS PARA BAR", "DESTAPADORES", "LICORERAS", "SACA CORCHOS", "SET Y ESTUCHES"],
    image: "/cat-bar.jpg",
    barColor: "bg-[#009EE2]",
  },
  {
    title: "BEBIDAS",
    subcategories: ["ARTICULOS PARA CAFÉ", "CILINDROS DE PLASTICO", "CILINDROS DE VIDRIO", "CILINDROS METÁLICOS", "TAZAS", "TERMO DE PLASTICO", "TERMO METALICO", "VASOS"],
      image: "/cat-bebidas.jpg",
      barColor: "bg-[#762281]",
  },
  {
    title: "BELLEZA",
    subcategories: ["ARTICULOS PARA DAMA", "BROCHAS Y MAQUILLAJE", "COSMETIQUERAS", "COSTUREROS", "ESPEJOS", "JOYERIA", "MANICURE", "SETS DE BELLEZA"],
    image: "/cat-belleza.jpg",
    barColor: "bg-[#93C01F]",
  },
  {
    title: "BOLSAS",
    subcategories: ["BOLSA MOCHILA", "BOLSAS ECOLOGICAS", "BOLSAS REUTILIZABLES", "BOLSAS CASUALES"],
      image: "/cat-bolsas.jpg",
      barColor: "bg-[#1BAFA6]",
  },
  {
    title: "COMPLEMENTOS",
    subcategories: ["ACCESORIOS Y COMPLEMENTOS"],
    image: "/cat-complementos.jpg",
    barColor: "bg-[#F6931D]",
  },
  {
    title: "DEPORTES",
    subcategories: ["ARTICULOS DEPORTIVOS", "FÚTBOL"],
    image: "/cat-deportes.jpg",
    barColor: "bg-[#1F5F9F]",
  },
  {
      title: "ENTRETENIMIENTO",
      subcategories: ["JUEGOS", "SETS DE ENTRETENIMIENTO"],
      image: "/cat-entretenimiento.jpg",
    barColor: "bg-[#462681]",
  },
  {
    title: "ESCRITURA",
    subcategories: ["BOLIGRAFOS ECOLOGICOS", "BOLIGRAFOS FUNCIONES", "BOLIGRAFOS METALICOS", "BOLIGRAFOS PLASTICOS", "SETS DE BOLIGRAFOS"],
      image: "/cat-escritura.jpg",
      barColor: "bg-[#E00273]",
    },
    {
      title: "HERRAMIENTAS",
    subcategories: ["AUTOMOVIL", "LAMPARAS", "NAVAJAS", "SET DE HERRAMIENTAS"],
    image: "/cat-herramientas.jpg",
    barColor: "bg-[#F3E610]",
  },
  {
    title: "HIELERAS Y PORTAVIANDAS",
    subcategories: ["MOCHILA - HIELERA", "HIELERAS Y LONCHERAS", "PORTAVIANDAS"],
    image: "/cat-hieleras.jpg",
    barColor: "bg-[#F6931D]",
  },
  {
      title: "HOGAR",
      subcategories: ["BBQ", "CESTOS", "COCINA", "DECORACION", "JARDINERÍA", "MANDILES", "MASCOTAS", "TABLAS Y SETS DE QUESOS"],
      image: "/cat-hogar.jpg",
    barColor: "bg-[#1F5F9F]",
  },
  {
    title: "LIBRETAS Y CARPETAS",
    subcategories: ["LIBRETAS EJECUTIVAS", "LIBRETAS ECOLOGICAS", "SETS DE LIBRETAS", "CARPETAS"],
      image: "/cat-libretas.jpg",
      barColor: "bg-[#00BBB5]",
    },
    {
      title: "LLAVEROS",
      subcategories: ["LLAVEROS CURPIEL", "LLAVEROS FUNCIONES", "LLAVEROS MADERA", "LLAVEROS METALICOS"],
      image: "/cat-llaveros.jpg",
    barColor: "bg-[#E00273]",
  },
  {
    title: "MALETAS",
    subcategories: ["MALETAS DE MANO", "MALETAS TROLLEY"],
    image: "/cat-maletas.jpg",
    barColor: "bg-[#F3E610]",
  },
  {
    title: "MOCHILAS",
    subcategories: ["MOCHILAS DE VIAJE", "MOCHILAS DEPORTIVAS", "MOCHILAS EJECUTIVAS", "MOCHILAS ESCOLARES", "MOCHILAS TROLLEY"],
    image: "/cat-mochilas.jpg",
    barColor: "bg-[#462681]",
  },
  {
      title: "NIÑOS",
      subcategories: ["ALCANCIAS", "ESCOLARES", "JUGUETES"],
      image: "/cat-ninos.jpg",
    barColor: "bg-[#009EE2]",
  },
  {
      title: "OFICINA",
      subcategories: ["ARTICULOS DE OFICINA", "CALCULADORAS", "PORTA NOTAS", "PORTAGAFETE", "RECONOCIMIENTOS", "RELOJES", "SETS EJECUTIVOS"],
      image: "/cat-oficina.jpg",
    barColor: "bg-[#762281]",
  },
  {
    title: "PARAGUAS E IMPERMEABLES",
    subcategories: ["IMPERMEABLES", "PARAGUAS"],
      image: "/cat-paraguas.jpg",
      barColor: "bg-[#93C01F]",
    },
    {
      title: "PORTAFOLIOS",
    subcategories: ["PORTAFOLIOS Y PORTALAPTOPS"],
    image: "/cat-portafolios.jpg",
    barColor: "bg-[#00BBB5]",
  },
  {
    title: "SALUD",
    subcategories: ["CUIDADO PERSONAL", "GELES Y SANITIZANTES", "PASTILLEROS"],
      image: "/cat-salud.jpg",
      barColor: "bg-[#F6931D]",
    },
    {
      title: "SETS DE REGALO",
    subcategories: ["SETS"],
    image: "/cat-sets-regalo.jpg",
    barColor: "bg-[#1F5F9F]",
  },
  {
    title: "TECNOLOGÍA",
    subcategories: ["CABLES Y CARGADORES", "ACCESORIOS DE COMPUTO", "ACCESORIOS PARA SMARTPHONE Y TABLET", "AUDÍFONOS", "BASES Y SOPORTES", "BOCINAS", "POWER BANKS", "SETS TECNOLOGIA", "USB"],
    image: "/cat-tecnologia.jpg",
    barColor: "bg-[#462681]",
  },
  {
    title: "TEXTILES",
    subcategories: ["CHAMARRAS Y CHALECOS", "GORRAS Y SOMBREROS", "PLAYERAS"],
    image: "/cat-textiles.jpg",
    barColor: "bg-[#E00273]",
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
                      <h3 className="font-['Montserrat'] font-bold text-sm md:text-base">
                        {cat.title}
                      </h3>
                      <div className="mt-1 space-y-0">
                          {cat.subcategories.map((sub) => (
                            <p
                              key={sub}
                              className="text-xs leading-tight font-semibold text-[#7A7A7A] dark:text-gray-400"
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
      <Footer lineHeight={15} />
    </main>
  );
}
