import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['Montserrat']">
      <Header />
      <main className="w-full">
        {/* Content placeholder */}
        <div className="w-full max-w-[1440px] mx-auto px-12 lg:px-16 py-12">
          <p className="text-[#111111] text-lg">
            Contenido de la página
          </p>
        </div>
      </main>
    </div>
  );
}
