"use client";

const solutions = [
  {
    icon: "/icons/icon-productos.png",
    title: "Productos",
    description:
      "Innovamos en productos, colores y materiales. Tenemos uno de los catálogos más amplios de la industria.",
  },
  {
    icon: "/icons/icon-personalizacion.png",
    title: "Personalización",
    description:
      "Todos nuestros productos son totalmente personalizables. Puedes utilizar nuestro visualizador con tu logotipo.",
  },
  {
    icon: "/icons/icon-proyectos.png",
    title: "Proyectos especiales",
    description:
      "¿No encontraste lo que buscabas? Podemos crear artículos a tu medida: lonas, flyers, notas de remisión y un sin fin de artículos impresos.",
  },
  {
    icon: "/icons/icon-distribucion.png",
    title: "Distribución",
    description:
      "Entregamos tus productos en cualquier rincón de México, con una logística confiable y eficiente.",
  },
];

export default function SolutionsSection() {
  return (
    <section className="w-full bg-white dark:bg-[#0E0F12] py-16 md:py-20 lg:py-16 transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Title - +20% larger */}
        <h2 className="text-center font-['Montserrat'] text-[36px] md:text-[46px] lg:text-[52px] tracking-[0.03em] text-[#111111] dark:text-[#F2F2F2] mb-4">
          <span className="font-normal">NUESTRAS </span>
          <span className="font-extrabold">SOLUCIONES</span>
        </h2>

        {/* Description - +12% larger */}
        <p className="text-center font-['Montserrat'] text-[15px] md:text-[17px] lg:text-[17px] leading-[1.75] text-[#2F2F2F] dark:text-[#CCCCCC] max-w-[960px] mx-auto mb-8 md:mb-10">
          Importamos, personalizamos y distribuimos los mejores productos promocionales para que tu
          negocio crezca. Con un catálogo exclusivo, precios competitivos y soluciones a la medida, somos
          el aliado estratégico que necesitas para ofrecer más y mejor a tus clientes.
        </p>

        {/* Cards Grid - larger cards with overflow visible for hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7 py-3 overflow-visible">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="bg-[#F2F2F2] dark:bg-[#1A1D24] rounded-xl p-6 lg:p-7 flex flex-col min-h-[220px] md:min-h-[240px] lg:min-h-[260px] will-change-transform transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] active:-translate-y-[3px] active:scale-[1.02] focus-within:ring-2 focus-within:ring-[#14C6C9]/60 focus-within:ring-offset-2 motion-reduce:hover:transform-none motion-reduce:hover:shadow-md"
            >
              {/* Icon Container - +25% larger */}
              <div className="w-[68px] h-[68px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] bg-white dark:bg-white rounded-[16px] lg:rounded-[18px] flex items-center justify-center mb-5 overflow-hidden">
                <img
                  src={solution.icon}
                  alt={solution.title}
                  width={90}
                  height={90}
                  className="w-[54px] h-[54px] md:w-[64px] md:h-[64px] lg:w-[72px] lg:h-[72px] object-contain block"
                />
              </div>

              {/* Title - larger */}
              <h3 className="font-['Montserrat'] text-[17px] md:text-[18px] lg:text-[19px] font-bold text-[#111111] dark:text-[#F2F2F2] mb-2">
                {solution.title}
              </h3>

              {/* Description - larger */}
              <p className="font-['Montserrat'] text-[14px] lg:text-[15px] leading-[1.65] text-[#4A4A4A] dark:text-[#AAAAAA]">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
