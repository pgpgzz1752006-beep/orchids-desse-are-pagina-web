'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'
import { parseImageUrl as parseImg } from '@/lib/imageUtils'

const PLACEHOLDER = '/placeholder-product.png'

const CATEGORY_LABELS: Record<string, string> = {
  termos: 'Termos y cilindros',
  bolsas: 'Bolsas y maletas',
  libretas: 'Libretas y carpetas',
  bar: 'Bar',
  regalos: 'Sets de regalo',
  deportes: 'Deportes',
  hogar: 'Artículos del hogar',
  gorras: 'Gorras y playeras',
}

interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  category_slug: string
  raw_category: string | null
  price: number | null
  stock: number | null
}

interface Props {
  product: Product
  related: Product[]
}

function parseImageUrl(raw: string | null): string {
  if (!raw) return PLACEHOLDER
  const trimmed = raw.trim()
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed) as unknown[]
      const first = arr[0]
      if (typeof first === 'string' && first.startsWith('http')) return first
    } catch { /* ignore */ }
  }
  if (trimmed.startsWith('http')) return trimmed
  return PLACEHOLDER
}

export default function ProductDetailClient({ product, related }: Props) {
  const mainImage = parseImageUrl(product.image_url)
  const [activeImage, setActiveImage] = useState(mainImage)
  const [imgError, setImgError] = useState(false)

  const waMessage = encodeURIComponent(
    `Hola, me interesa cotizar: ${product.name} (SKU: ${product.sku}).`
  )
  const waLink = `https://wa.me/529512424333?text=${waMessage}`

  const categoryLabel = CATEGORY_LABELS[product.category_slug] ?? product.raw_category ?? product.category_slug

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[12px] text-[#888] mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#14C6C9] transition-colors">Inicio</Link>
        <span>/</span>
        <Link
          href={`/productos?category=${product.category_slug}`}
          className="hover:text-[#14C6C9] transition-colors"
        >
          {categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-[#333] dark:text-[#CCC] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main layout: gallery left, info right */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 lg:mb-16">

        {/* ── Gallery ─────────────────────────────── */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4">
          {/* Main image */}
          <div className="relative w-full aspect-square max-h-[480px] bg-white dark:bg-[#1A1D24] rounded-2xl border border-[#E0E0E0] dark:border-[#2A2D34] overflow-hidden flex items-center justify-center p-6">
            <Image
              src={imgError ? PLACEHOLDER : activeImage}
              alt={product.name}
              fill
              className="object-contain transition-opacity duration-[200ms]"
              onError={() => { setImgError(true); setActiveImage(PLACEHOLDER) }}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        </div>

        {/* ── Product Info ─────────────────────────── */}
        <div className="w-full lg:w-[55%] flex flex-col gap-5">

          {/* Category badge */}
          <Link
            href={`/productos?category=${product.category_slug}`}
            className="inline-flex w-fit px-3 py-1 rounded-full text-[11px] font-semibold bg-[#14C6C9]/10 text-[#14C6C9] uppercase tracking-wide hover:bg-[#14C6C9]/20 transition-colors"
          >
            {categoryLabel}
          </Link>

          {/* Name */}
          <h1 className="text-[22px] md:text-[28px] lg:text-[32px] font-extrabold text-[#111] dark:text-[#F2F2F2] leading-tight uppercase tracking-wide">
            {product.name}
          </h1>

          {/* SKU */}
          <p className="text-[12px] text-[#999] dark:text-[#666] font-medium">
            SKU: <span className="text-[#555] dark:text-[#AAA]">{product.sku}</span>
          </p>

          {/* Price */}
          <div className="py-3 border-t border-b border-[#E8E8E8] dark:border-[#2A2D34]">
            {product.price ? (
              <p className="text-[28px] md:text-[34px] font-extrabold text-[#14C6C9]">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                <span className="text-[14px] font-medium text-[#999] ml-2">MXN</span>
              </p>
            ) : (
              <div>
                <p className="text-[22px] font-bold text-[#AAAAAA]">Consultar precio</p>
                <p className="text-[12px] text-[#BBB] mt-0.5">Contáctanos para cotización personalizada</p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-[14px] text-[#555] dark:text-[#BBB] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a952] text-white font-bold text-[15px] px-6 py-3.5 rounded-xl transition-colors duration-200 min-h-[48px]"
            >
              <MessageCircle className="w-5 h-5" />
              Cotizar por WhatsApp
            </a>

            <Link
              href={`/productos?category=${product.category_slug}`}
              className="flex items-center justify-center gap-2 border border-[#D9D9D9] dark:border-[#333] text-[#555] dark:text-[#CCC] hover:border-[#14C6C9] hover:text-[#14C6C9] font-semibold text-[14px] px-6 py-3.5 rounded-xl transition-colors duration-200 min-h-[48px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a productos
            </Link>
          </div>

          {/* Stock badge */}
          {product.stock !== null && product.stock > 0 && (
            <p className="text-[12px] text-emerald-500 font-medium">
              ✓ {product.stock} unidades disponibles
            </p>
          )}
        </div>
      </div>

      {/* ── Related products ─────────────────────────────── */}
      {related.length > 0 && (
        <section>
          <h2 className="text-[20px] md:text-[24px] font-extrabold text-[#111] dark:text-[#F2F2F2] uppercase tracking-wide mb-6">
            Productos <span className="text-[#14C6C9]">relacionados</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/producto/${p.slug}`}
                className="group bg-white dark:bg-white border border-[#D9D9D9] rounded-[11px] p-4 flex flex-col transition-all duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-[6px] hover:scale-[1.03] hover:shadow-[0_16px_34px_rgba(0,0,0,0.14)]"
              >
                <div className="flex items-center justify-center h-[130px] mb-3">
                  <Image
                    src={parseImageUrl(p.image_url)}
                    alt={p.name}
                    width={130}
                    height={130}
                    className="max-h-[120px] w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
                  />
                </div>
                <p className="text-[10px] md:text-[11px] font-semibold text-[#333] text-center uppercase leading-[1.4] min-h-[28px] flex-1">
                  {p.name}
                </p>
                <p className="text-[12px] font-bold text-[#14C6C9] text-center mt-1">
                  {p.price
                    ? `$${p.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                    : <span className="text-[#AAAAAA] font-medium">Consultar</span>
                  }
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
