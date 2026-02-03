import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import SolutionsSection from "@/components/SolutionsSection";
import ProductStrip from "@/components/ProductStrip";
import ChatButtonSection from "@/components/ChatButtonSection";
import Footer from "@/components/Footer";

const featuredProducts = [
  {
    name: "BOLSA-MOCHILA MÁGICA SOCCER MÉXICO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-075-1770140354033.jpg?width=400&height=400&resize=contain",
    href: "/productos/bolsa-mochila-magica-soccer-mexico",
  },
  {
    name: "VASO CHAMPION ROJO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-048-R-1770140355309.jpg?width=400&height=400&resize=contain",
    href: "/productos/vaso-champion-rojo",
  },
  {
    name: "BALÓN SPORT NEGRO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-350-N-1770140350957.jpg?width=400&height=400&resize=contain",
    href: "/productos/balon-sport-negro",
  },
  {
    name: "SET BBQ SOCCER",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain",
    href: "/productos/set-bbq-soccer",
  },
  {
    name: "PELOTA ANTI-STRESS FÚTBOL",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-011-01_1-1770140356623.jpg?width=400&height=400&resize=contain",
    href: "/productos/pelota-antistress-futbol",
  },
];

const recommendedProducts = [
  {
    name: "BOLSA-MOCHILA MÁGICA SOCCER MÉXICO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-075-1770140354033.jpg?width=400&height=400&resize=contain",
    href: "/productos/bolsa-mochila-magica-soccer-mexico",
  },
  {
    name: "VASO CHAMPION ROJO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-048-R-1770140355309.jpg?width=400&height=400&resize=contain",
    href: "/productos/vaso-champion-rojo",
  },
  {
    name: "BALÓN SPORT NEGRO",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-350-N-1770140350957.jpg?width=400&height=400&resize=contain",
    href: "/productos/balon-sport-negro",
  },
  {
    name: "SET BBQ SOCCER",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain",
    href: "/productos/set-bbq-soccer",
  },
  {
    name: "PELOTA ANTI-STRESS FÚTBOL",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-011-01_1-1770140356623.jpg?width=400&height=400&resize=contain",
    href: "/productos/pelota-antistress-futbol",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['Montserrat']">
      <Header />
      <main className="w-full">
        <HeroBanner />
        <ProductStrip
          titleRegular="PRODUCTOS"
          titleBold="DESTACADOS"
          products={featuredProducts}
        />
        <CategoriesSection />
        <ProductStrip
          titleRegular="PRODUCTOS"
          titleBold="RECOMENDADOS"
          products={recommendedProducts}
        />
        <SolutionsSection />
        <ChatButtonSection />
      </main>
      <Footer />
    </div>
  );
}
