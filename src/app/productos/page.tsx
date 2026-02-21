"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
    <div className="bg-white dark:bg-[#1A1D24] border border-[#E0E0E0] dark:border-[#2A2D34] rounded-[11px] p-4 animate-pulse">
      <div className="h-[140px] bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [activeSearch, setActiveSearch] = useState(q);
  const limit = 12;

  useEffect(() => {
    setPage(1);
    setActiveSearch(q);
    setSearch(q);
  }, [category, q]);

  useEffect(() => {
    setLoading(true);
    let url = "";
    if (activeSearch) {
      url = `/api/products/search?q=${encodeURIComponent(activeSearch)}&page=${page}&limit=${limit}`;
    } else if (category) {
      url = `/api/products?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`;
    } else {
      url = `/api/products?page=${page}&limit=${limit}`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, activeSearch, page]);

  const title = activeSearch
    ? `Resultados para "${activeSearch}"`
    : category
    ? CATEGORY_LABELS[category] ?? category
    : "Todos los productos";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300">
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#888] mb-6">
          <Link href="/" className="hover:text-[#14C6C9] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#333] dark:text-[#CCC]">{title}</span>
        </div>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setActiveSearch(search);
          }}
          className="flex gap-2 mb-8 max-w-lg"
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

        {/* Title + count */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-[#F2F2F2] uppercase tracking-wide">
            {title}
          </h1>
          {!loading && (
            <span className="text-sm text-[#888]">{total} producto{total !== 1 ? "s" : ""}</span>
          )}
        </div>



          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-[#888]">
              <p className="text-lg font-semibold mb-2">Sin resultados</p>
              <p className="text-sm">Intenta con otra categoría o término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Safety net: deduplicate by SKU before rendering */}
                {Array.from(
                  products.reduce((map, p) => {
                    if (!map.has(p.sku)) map.set(p.sku, p);
                    return map;
                  }, new Map<string, Product>()).values()
                ).map((product) => (
                  <Link
                    key={product.id}
                    href={product.slug ? `/producto/${product.slug}` : `/productos?category=${product.category_slug}`}
                    className="bg-white dark:bg-white border border-[#D9D9D9] rounded-[11px] p-4 flex flex-col transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[6px] hover:scale-[1.03] hover:shadow-[0_16px_34px_rgba(0,0,0,0.14)] cursor-pointer"
                  >
                    <div className="flex items-center justify-center h-[140px] mb-3">
                      <Image
                        src={parseImageUrl(product.image_url) || "/placeholder-product.png"}
                        alt={product.name}
                        width={140}
                        height={140}
                        className="max-h-[130px] w-auto object-contain"
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
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-sm text-[#888]">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
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
