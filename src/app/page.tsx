import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import SolutionsSection from "@/components/SolutionsSection";
import RecommendedProductsSection from "@/components/RecommendedProductsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-['Montserrat']">
      <Header />
      <main className="w-full">
        <HeroBanner />
        <CategoriesSection />
        <SolutionsSection />
        <RecommendedProductsSection />
      </main>
    </div>
  );
}
