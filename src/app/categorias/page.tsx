"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState } from "react";

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
  const [selected, setSelected] = useState<typeof categorias[number] | null>(null);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0E0F12] text-[#111111] dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {categorias.map((cat) => (
            <div
              key={cat.title}
              onClick={() => setSelected(cat)}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer h-52 will-change-transform transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] hover:z-10 active:-translate-y-[3px] active:scale-[1.02]"
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

      {/* Pop-up modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-[#1A1B1F] rounded-2xl shadow-2xl max-w-lg w-[90%] overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative w-full h-56">
              <Image
                src={selected.image}
                alt={selected.title}
                fill
                className="object-cover"
              />
              <div className={`absolute bottom-0 left-0 right-0 h-2 ${selected.barColor}`} />
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="font-['Montserrat'] font-bold text-xl md:text-2xl mb-4">
                {selected.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                {selected.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/10 text-[#555] dark:text-gray-300"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Close button */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 font-semibold text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer lineHeight={15} />
      <WhatsAppButton />
    </main>
  );
}
