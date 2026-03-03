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
  { name: "VASO CHAMPION", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-048-R-1770140355309.jpg?width=400&height=400&resize=contain", href: "/producto/vaso-champion-soc-048" },
  { name: "BALÓN SPORT", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-350-N-1770140350957.jpg?width=400&height=400&resize=contain", href: "/producto/bal-n-sport-soc-350" },
  { name: "BALÓN SPACE", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain", href: "/producto/bal-n-space-soc-650" },
  { name: "PELOTA ANTI-STRESS COLORFUL", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-011-01_1-1770140356623.jpg?width=400&height=400&resize=contain", href: "/producto/pelota-anti-stress-colorful-soc-910-" },
  { name: "BALÓN KIRALY", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-075-1770140354033.jpg?width=400&height=400&resize=contain", href: "/producto/bal-n-kiraly-soc-550" },
  { name: "PARAGUAS SOCCER FIELD", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/227d548b-b8f5-4d86-a14b-344106766009/SOC-090-1770140352614.jpg?width=400&height=400&resize=contain", href: "/producto/paraguas-soccer-field-soc-062" },
];

function dbProductsToStrip(rows: { sku: string; name: string; image_url: string | null; category_slug: string; slug: string | null }[]) {
  return rows.map((p) => ({
    name: p.name,
    image: p.image_url || PLACEHOLDER_IMAGE,
    href: p.slug ? `/producto/${p.slug}` : `/productos?category=${p.category_slug}`,
  }))
}

async function getBestSellers() {
  const { data, error } = await supabase
    .from("products")
    .select("sku, name, image_url, category_slug, slug")
    .eq("is_best_seller", true)
    .limit(24);
  if (error || !data?.length) return null;
  return dbProductsToStrip(data);
}

async function getRecommended() {
  const { data, error } = await supabase
    .from("products")
    .select("sku, name, image_url, category_slug, slug")
    .eq("is_recommended", true)
    .limit(24);
  if (error || !data?.length) return null;
  return dbProductsToStrip(data);
}

async function getNewProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("sku, name, image_url, category_slug, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(24);
  if (error || !data?.length) return null;
  return dbProductsToStrip(data);
}

export default async function Home() {
  const [bestSellers, recommended, newProducts] = await Promise.all([
    getBestSellers(),
    getRecommended(),
    getNewProducts(),
  ]);

  const featuredProducts = bestSellers ?? staticFeatured;
  const recommendedProducts = recommended ?? staticFeatured;
  const newProductsList = newProducts ?? staticFeatured;

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
        <ProductStrip
          titleRegular=""
          titleBold="NUEVOS"
          products={newProductsList}
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
