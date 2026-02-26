"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductFilters from "@/components/ProductFilters";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  category_slug: string;
  price: number | null;
  stock: number | null;
}

/** Extract a usable URL from image_url, which may be stored as a JSON array string */
function parseImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
      const first = arr[0];
      if (typeof first === "string" && first.startsWith("http")) return first;
    } catch {
      // fall through
    }
  }
  if (trimmed.startsWith("http")) return trimmed;
  return null;
}

const CATEGORY_LABELS: Record<string, string> = {
  termos: "Bebidas y Termos",
  bolsas: "Bolsas, Mochilas y Maletas",
  libretas: "Libretas, Escritura y Oficina",
  bar: "Bar",
  regalos: "Sets de Regalo y Accesorios",
  deportes: "Deportes",
  hogar: "Hogar y Herramientas",
  gorras: "Textiles y Gorras",
};

function SkeletonCard() {
    return (
      <div className="bg-white dark:bg-[#1A1D24] border border-[#E0E0E0] dark:border-[#2A2D34] rounded-[11px] p-3 animate-pulse">
        <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#F2F2F2] dark:bg-gray-700 rounded-[10px] mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState({
    color: searchParams.get("color")?.split(",").filter(Boolean) || [],
    brand: searchParams.get("brand")?.split(",").filter(Boolean) || [],
    type: searchParams.get("type")?.split(",").filter(Boolean) || [],
    cat: searchParams.get("cat")?.split(",").filter(Boolean) || [],
    cap: searchParams.get("cap")?.split(",").filter(Boolean) || [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [activeSearch, setActiveSearch] = useState(q);
  const limit = 12;

  // Sync state with URL when it changes (for back/forward buttons)
  useEffect(() => {
    setSelectedFilters({
      color: searchParams.get("color")?.split(",").filter(Boolean) || [],
      brand: searchParams.get("brand")?.split(",").filter(Boolean) || [],
      type: searchParams.get("type")?.split(",").filter(Boolean) || [],
      cat: searchParams.get("cat")?.split(",").filter(Boolean) || [],
      cap: searchParams.get("cap")?.split(",").filter(Boolean) || [],
    });
    setPage(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
    setActiveSearch(searchParams.get("q") || "");
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const updateUrl = useCallback((newFilters: any, newPage: number, newQ: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (newQ) params.set("q", newQ);
    if (newPage > 1) params.set("page", String(newPage));
    
    Object.entries(newFilters).forEach(([key, values]: [string, any]) => {
      if (values.length > 0) params.set(key, values.join(","));
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [category, pathname, router]);

  const handleFilterChange = (filters: any) => {
    setSelectedFilters(filters);
    setPage(1);
    // Instant update for URL to keep UI in sync, 
    // but the actual fetch is already triggered by the useEffect on selectedFilters
    updateUrl(filters, 1, activeSearch);
  };

  const handleClearFilters = () => {
    const cleared = { color: [], brand: [], type: [], cat: [], cap: [] };
    setSelectedFilters(cleared);
    setPage(1);
    updateUrl(cleared, 1, activeSearch);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (activeSearch) params.set("q", activeSearch);
    params.set("page", String(page));
    params.set("limit", String(limit));
    
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) params.set(key, values.join(","));
    });

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, activeSearch, page, selectedFilters]);

  const title = activeSearch
    ? `Resultados para "${activeSearch}"`
    : category
    ? CATEGORY_LABELS[category] ?? category
    : "Todos los productos";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
    updateUrl(selectedFilters, 1, search);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300">
      <Header />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#888] mb-6">
          <Link href="/" className="hover:text-[#14C6C9] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#333] dark:text-[#CCC]">{title}</span>
        </div>

        {/* Top Controls: Search + Mobile Filter Button */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex gap-2"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 border border-[#D9D9D9] dark:border-[#333] rounded-lg px-4 py-2 text-sm bg-white dark:bg-[#1A1D24] text-[#333] dark:text-[#EEE] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/50"
            />
            <button
              type="submit"
              className="bg-[#14C6C9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#11b3b6] transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden">
            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#D9D9D9] dark:border-[#333] rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  FILTROS
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[999]" />
                <Drawer.Content className="bg-white dark:bg-[#0E0F12] flex flex-col rounded-t-[20px] h-[85%] fixed bottom-0 left-0 right-0 z-[1000] p-6 focus:outline-none shadow-2xl">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                  <div className="overflow-y-auto flex-1">
                    <ProductFilters
                      selectedFilters={selectedFilters}
                      onChange={handleFilterChange}
                      onClear={handleClearFilters}
                      category={category}
                    />
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                selectedFilters={selectedFilters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                category={category}
              />
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-6">
              <h1 className="text-[20px] md:text-[28px] font-extrabold text-[#111] dark:text-[#F2F2F2] uppercase tracking-wide">
                {title}
              </h1>
              {!loading && (
                <span className="text-sm text-[#888] font-medium">{total} producto{total !== 1 ? "s" : ""}</span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 text-[#888] bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-lg font-semibold mb-2 text-gray-400">Sin resultados</p>
                <p className="text-sm">Intenta ajustar tus filtros o búsqueda.</p>
                {Object.values(selectedFilters).some(a => a.length > 0) && (
                  <button 
                    onClick={handleClearFilters}
                    className="mt-4 text-[#14C6C9] font-semibold text-sm hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={product.slug ? `/producto/${product.slug}` : `/productos?category=${product.category_slug}`}
                    className="bg-white dark:bg-white border border-[#D9D9D9] rounded-[11px] p-3 flex flex-col transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[6px] hover:scale-[1.03] hover:shadow-[0_16px_34px_rgba(0,0,0,0.14)] cursor-pointer"
                  >
                    <div className="flex items-center justify-center rounded-[10px] overflow-hidden bg-[#F2F2F2] h-[140px] sm:h-[160px] lg:h-[180px] mb-3 p-4 flex-shrink-0">
                      <Image
                        src={parseImageUrl(product.image_url) || "/placeholder-product.png"}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                    <p className="font-['Montserrat'] text-[10px] md:text-[11px] font-semibold text-[#333] text-center uppercase leading-[1.4] min-h-[28px] flex-1">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-[#999] text-center mt-1">{product.sku}</p>
                    <p className="text-[13px] font-bold text-[#14C6C9] text-center mt-1">
                      {product.price
                        ? `$${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                        : <span className="text-[#AAAAAA] font-medium">Consultar</span>
                      }
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage(p => p - 1);
                    updateUrl(selectedFilters, page - 1, activeSearch);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors font-medium"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-[#888] font-medium">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage(p => p + 1);
                    updateUrl(selectedFilters, page + 1, activeSearch);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors font-medium"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer lineHeight={3} />
      <WhatsAppButton />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0E0F12]" />}>
      <ProductsContent />
    </Suspense>
  );
}
