import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import SolutionsSection from "@/components/SolutionsSection";
import ProductStrip from "@/components/ProductStrip";
import ChatButtonSection from "@/components/ChatButtonSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const PLACEHOLDER_IMAGE = "/placeholder-product.png";

const staticFeatured = [
  { name: "BOLSA-MOCHILA MÁGICA SOCCER", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-075-1770140354033.jpg?width=400&height=400&resize=contain", href: "/productos/bolsa-mochila-magica-soccer-mexico" },
  { name: "VASO CHAMPION ROJO", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-048-R-1770140355309.jpg?width=400&height=400&resize=contain", href: "/productos/vaso-champion-rojo" },
  { name: "BALÓN SPORT NEGRO", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-350-N-1770140350957.jpg?width=400&height=400&resize=contain", href: "/productos/balon-sport-negro" },
  { name: "SET BBQ SOCCER", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain", href: "/productos/set-bbq-soccer" },
  { name: "PELOTA ANTI-STRESS FÚTBOL", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-011-01_1-1770140356623.jpg?width=400&height=400&resize=contain", href: "/productos/pelota-antistress-futbol" },
  { name: "TERMO SOCCER ACERO", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain", href: "/productos/termo-soccer-acero" },
];

function dbProductsToStrip(rows: { sku: string; name: string; image_url: string | null; category_slug: string }[]) {
  return rows.map((p) => ({
    name: p.name,
    image: p.image_url || PLACEHOLDER_IMAGE,
    href: `/productos/${p.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  }));
}

async function getBestSellers() {
  const { data, error } = await supabase
    .from("products")
    .select("sku, name, image_url, category_slug")
    .eq("is_best_seller", true)
    .limit(24);
  if (error || !data?.length) return null;
  return dbProductsToStrip(data);
}

async function getRecommended() {
  const { data, error } = await supabase
    .from("products")
    .select("sku, name, image_url, category_slug")
    .eq("is_recommended", true)
    .limit(24);
  if (error || !data?.length) return null;
  return dbProductsToStrip(data);
}

export default async function Home() {
  const [bestSellers, recommended] = await Promise.all([
    getBestSellers(),
    getRecommended(),
  ]);

  const featuredProducts = bestSellers ?? staticFeatured;
  const recommendedProducts = recommended ?? staticFeatured;

  return (
    <div id="top" className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300">
      <main className="w-full">
        <HeroBanner />
        <ProductStrip
          titleRegular="MÁS"
          titleBold="VENDIDOS"
          products={featuredProducts}
          autoplay
        />
        <CategoriesSection />
        <ProductStrip
          titleRegular="PRODUCTOS"
          titleBold="RECOMENDADOS"
          products={recommendedProducts}
          autoplay
        />
        <SolutionsSection />
        <ChatButtonSection />
      </main>
      <Footer lineHeight={3} />
      <WhatsAppButton />
    </div>
  );
}
