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
    <section className="w-full bg-white dark:bg-[#0E0F12] pt-4 md:pt-6 lg:pt-6 pb-14 md:pb-16 lg:pb-14 transition-colors duration-300 overflow-visible">
      <div className="w-full max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Title - larger +30% */}
        <h2 className="text-center font-['Montserrat'] text-[42px] md:text-[54px] lg:text-[62px] tracking-[0.03em] text-[#111111] dark:text-[#F2F2F2] mb-3">
          <span className="font-normal">NUESTRAS </span>
          <span className="font-extrabold">SOLUCIONES</span>
        </h2>

        {/* Description - larger +15% */}
        <p className="text-center font-['Montserrat'] text-[16px] md:text-[18px] lg:text-[19px] leading-[1.6] text-[#2F2F2F] dark:text-[#CCCCCC] max-w-[1000px] mx-auto mb-6 md:mb-8">
          Importamos, personalizamos y distribuimos los mejores productos promocionales para que tu
          negocio crezca. Con un catálogo exclusivo, precios competitivos y soluciones a la medida, somos
          el aliado estratégico que necesitas para ofrecer más y mejor a tus clientes.
        </p>

        {/* Cards Grid - larger cards with overflow visible for hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8 pt-2 pb-4 overflow-visible">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="bg-[#F2F2F2] dark:bg-[#1A1D24] rounded-xl p-7 lg:p-8 flex flex-col min-h-[260px] md:min-h-[280px] lg:min-h-[300px] will-change-transform transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-2 hover:scale-[1.05] hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)] active:-translate-y-[3px] active:scale-[1.02] focus-within:ring-2 focus-within:ring-[#14C6C9]/60 focus-within:ring-offset-2 motion-reduce:hover:transform-none motion-reduce:hover:shadow-md"
            >
              {/* Icon Container - larger +30% */}
              <div className="w-[80px] h-[80px] md:w-[96px] md:h-[96px] lg:w-[110px] lg:h-[110px] bg-white dark:bg-white rounded-[18px] lg:rounded-[20px] flex items-center justify-center mb-5 overflow-hidden">
                <img
                  src={solution.icon}
                  alt={solution.title}
                  width={110}
                  height={110}
                  className="w-[64px] h-[64px] md:w-[76px] md:h-[76px] lg:w-[88px] lg:h-[88px] object-contain block"
                />
              </div>

              {/* Title - larger */}
              <h3 className="font-['Montserrat'] text-[18px] md:text-[20px] lg:text-[21px] font-bold text-[#111111] dark:text-[#F2F2F2] mb-2">
                {solution.title}
              </h3>

              {/* Description - larger */}
              <p className="font-['Montserrat'] text-[15px] lg:text-[16px] leading-[1.6] text-[#4A4A4A] dark:text-[#AAAAAA]">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
