"use client";

const solutions = [
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-10-1770147602221.png?width=200&height=200&resize=contain",
    title: "Productos",
    description:
      "Innovamos en productos, colores y materiales. Tenemos uno de los catálogos más amplios de la industria.",
  },
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-11-1770145556872.png?width=200&height=200&resize=contain",
    title: "Personalización",
    description:
      "Todos nuestros productos son totalmente personalizables. Puedes utilizar nuestro visualizador con tu logotipo.",
  },
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-12-1770147598107.png?width=200&height=200&resize=contain",
    title: "Proyectos especiales",
    description:
      "¿No encontraste lo que buscabas? Podemos crear artículos a tu medida: lonas, flyers, notas de remisión y un sin fin de artículos impresos.",
  },
  {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/disenare-maqueta-13-1770147592915.png?width=200&height=200&resize=contain",
    title: "Distribución",
    description:
      "Entregamos tus productos en cualquier rincón de México, con una logística confiable y eficiente.",
  },
];

export default function SolutionsSection() {
  return (
    <section className="w-full bg-white py-16 md:py-20 lg:py-16">
      <div className="w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-8">
        {/* Title */}
        <h2 className="text-center font-['Montserrat'] text-[30px] md:text-[38px] lg:text-[44px] tracking-[0.03em] text-[#111111] mb-5">
          <span className="font-normal">NUESTRAS </span>
          <span className="font-extrabold">SOLUCIONES</span>
        </h2>

        {/* Description */}
        <p className="text-center font-['Montserrat'] text-[14px] md:text-[15px] lg:text-[15px] leading-[1.7] text-[#2F2F2F] max-w-[880px] mx-auto mb-10 md:mb-12 lg:mb-14">
          Importamos, personalizamos y distribuimos los mejores productos promocionales para que tu
          negocio crezca. Con un catálogo exclusivo, precios competitivos y soluciones a la medida, somos
          el aliado estratégico que necesitas para ofrecer más y mejor a tus clientes.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {solutions.map((solution) => (
            <div
              key={solution.title}
              className="bg-[#F2F2F2] rounded-xl p-5 lg:p-[22px] flex flex-col transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-sm"
            >
            {/* Icon Container */}
                <div className="w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] bg-white rounded-[14px] lg:rounded-[16px] flex items-center justify-center mb-4">
                  <img
                    src={solution.icon}
                    alt={solution.title}
                    width={44}
                    height={44}
                    className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] lg:w-[54px] lg:h-[54px] object-contain block"
                  />
              </div>

              {/* Title */}
              <h3 className="font-['Montserrat'] text-[16px] lg:text-[17px] font-bold text-[#111111] mb-2">
                {solution.title}
              </h3>

              {/* Description */}
              <p className="font-['Montserrat'] text-[13px] lg:text-[13.5px] leading-[1.6] text-[#4A4A4A] min-h-[72px]">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
