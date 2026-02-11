import Image from "next/image";

export default function CategoriasPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0E0F12] text-[#111111] dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="font-['Montserrat'] text-4xl md:text-5xl font-bold text-center mb-12">
          Categorías
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tarjeta Antiestrés */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex">
              <div className="w-1/2 relative aspect-square bg-sky-200">
                <Image
                  src="/antiestres.jpg"
                  alt="Figuras Antiestrés"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-1/2 flex flex-col">
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <h3 className="font-['Montserrat'] font-bold text-base md:text-lg">
                    ANTIESTRES
                  </h3>
                  <p className="text-sm text-[#7A7A7A] dark:text-gray-400 mt-1">
                    FIGURAS ANTIESTRES
                  </p>
                </div>
                <div className="w-2 bg-yellow-400 self-end h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
