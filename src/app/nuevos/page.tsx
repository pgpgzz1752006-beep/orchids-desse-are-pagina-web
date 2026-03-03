"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Sparkles } from "lucide-react";

interface ImagesJson {
  mainImages?: string[];
  vectorImages?: string[];
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  images_json: ImagesJson | null;
  category_slug: string;
  price: number | null;
  created_at: string | null;
}

function parseImageUrl(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
      const first = arr[0];
      if (typeof first === "string" && first.startsWith("http")) return first;
    } catch { /* fall through */ }
  }
  if (trimmed.startsWith("http")) return trimmed;
  return null;
}

function getProductImages(product: Product): string[] {
  const main = product.images_json?.mainImages ?? [];
  const valid = main.filter((u) => typeof u === "string" && u.startsWith("http"));
  if (valid.length > 0) return valid;
  const fallback = parseImageUrl(product.image_url);
  return fallback ? [fallback] : [];
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? "s" : ""}`;
  return `Hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? "es" : ""}`;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[11px] p-3 animate-pulse">
      <div className="h-[160px] bg-[#F2F2F2] rounded-[10px] mb-3" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const images = getProductImages(product);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const hoverRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const href = product.slug ? `/producto/${product.slug}` : `/productos`;

  const switchTo = (idx: number) => {
    if (idx === activeIdx) return;
    setFading(true);
    setTimeout(() => { setActiveIdx(idx); setFading(false); }, 120);
  };

  const handleMouseEnter = () => {
    if (images.length <= 1) return;
    let i = 1;
    hoverRef.current = setInterval(() => { switchTo(i % images.length); i++; }, 900);
  };
  const handleMouseLeave = () => {
    if (hoverRef.current) clearInterval(hoverRef.current);
    hoverRef.current = null;
    switchTo(0);
  };

  return (
    <Link
      href={href}
      className="group bg-white border border-[#D9D9D9] rounded-[11px] p-3 flex flex-col transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[6px] hover:scale-[1.03] hover:shadow-[0_16px_34px_rgba(0,0,0,0.14)] cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* NEW badge */}
      <span className="absolute top-2 left-2 z-10 bg-[#14C6C9] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
        Nuevo
      </span>

      <div className="relative flex items-center justify-center rounded-[10px] overflow-hidden bg-[#F2F2F2] h-[160px] mb-2 p-3 flex-shrink-0">
        <Image
          src={images[activeIdx] ?? "/placeholder-product.png"}
          alt={product.name}
          width={180}
          height={180}
          className={`w-full h-full object-contain transition-opacity duration-[120ms] ${fading ? "opacity-0" : "opacity-100"}`}
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.png"; }}
        />
        {images.length > 1 && (
          <span className="absolute bottom-1.5 right-1.5 text-[9px] font-semibold bg-black/50 text-white rounded-full px-1.5 py-0.5 leading-none">
            {activeIdx + 1}/{images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1 justify-center mb-2 overflow-x-auto scrollbar-hide px-1">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.preventDefault(); switchTo(i); }}
              onMouseEnter={(e) => { e.preventDefault(); switchTo(i); }}
              className={`flex-shrink-0 w-7 h-7 rounded-[5px] overflow-hidden border-[1.5px] transition-all duration-150 ${
                i === activeIdx ? "border-[#14C6C9] scale-105 shadow-sm" : "border-[#E0E0E0] hover:border-[#14C6C9]/60"
              }`}
            >
              <Image
                src={url}
                alt={`${product.name} vista ${i + 1}`}
                width={28}
                height={28}
                className="w-full h-full object-contain bg-[#F7F7F7]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </button>
          ))}
        </div>
      )}

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
      {product.created_at && (
        <p className="text-[9px] text-[#AAAAAA] text-center mt-1">{timeAgo(product.created_at)}</p>
      )}
    </Link>
  );
}

function NuevosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [activeSearch, setActiveSearch] = useState(q);
  const limit = 24;

  useEffect(() => {
    setPage(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
    setActiveSearch(searchParams.get("q") || "");
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const updateUrl = useCallback((newPage: number, newQ: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/nuevos${params.toString() ? "?" + params.toString() : ""}`);
  }, [router]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", "newest");
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (activeSearch) params.set("q", activeSearch);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeSearch, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
    updateUrl(1, search);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300">
      <Header />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#888] mb-6">
          <Link href="/" className="hover:text-[#14C6C9] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#333] dark:text-[#CCC]">Nuevos</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-7 h-7 text-[#14C6C9]" />
          <h1 className="text-[24px] md:text-[32px] font-extrabold text-[#111] dark:text-[#F2F2F2] uppercase tracking-wide">
            Nuevos productos
          </h1>
        </div>
        <p className="text-sm text-[#888] mb-8 -mt-4">
          Los últimos productos agregados al catálogo, actualizados automáticamente desde el proveedor.
        </p>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-8 max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en nuevos productos..."
            className="flex-1 border border-[#D9D9D9] dark:border-[#333] rounded-lg px-4 py-2 text-sm bg-white dark:bg-[#1A1D24] text-[#333] dark:text-[#EEE] focus:outline-none focus:ring-2 focus:ring-[#14C6C9]/50"
          />
          <button
            type="submit"
            className="bg-[#14C6C9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#11b3b6] transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-[#888] font-medium mb-4">
            {total} producto{total !== 1 ? "s" : ""}
            {activeSearch && ` para "${activeSearch}"`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
            {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-[#888] bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-lg font-semibold mb-2 text-gray-400">Sin resultados</p>
            <p className="text-sm">No se encontraron productos nuevos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); updateUrl(page - 1, activeSearch); }}
              className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors font-medium"
            >
              ← Anterior
            </button>
            <span className="text-sm text-[#888] font-medium">Página {page} de {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); updateUrl(page + 1, activeSearch); }}
              className="px-4 py-2 rounded-lg border border-[#D9D9D9] dark:border-[#333] text-sm disabled:opacity-40 hover:border-[#14C6C9] hover:text-[#14C6C9] transition-colors font-medium"
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

export default function NuevosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#0E0F12]" />}>
      <NuevosContent />
    </Suspense>
  );
}
