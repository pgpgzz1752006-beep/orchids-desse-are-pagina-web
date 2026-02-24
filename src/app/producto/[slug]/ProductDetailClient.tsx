'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, Check, MessageCircle, ZoomIn } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

interface Dimensions {
  heightInCentimeters?: number | null
  lengthInCentimeters?: number | null
  widthInCentimeters?: number | null
  individualBoxDimensions?: string | null
}

interface Weight {
  grossWeight?: number | null
  netWeight?: number | null
  unitWeight?: string | null
}

interface MediaImages {
  mainImages?: string[]
  vectorImages?: string[]
}

interface Variant {
  sku: string
  name: string
  color?: string | null
  size?: string | null
  pricing?: { priceMx?: Array<{ amount: string; currency: string }> } | null
  availability?: { isEnabledVariantMx?: boolean } | null
}

interface RelatedProduct {
  id: string
  sku: string
  name: string
  slug: string
  image_url: string | null
  price: number | null
  category_slug: string
}

interface Props {
  product: Record<string, unknown>
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return 'Consultar'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(price)
}

function stockLabel(stock: number | null | undefined): { text: string; color: string } {
  if (stock == null) return { text: 'Consultar disponibilidad', color: 'text-yellow-600' }
  if (stock === 0) return { text: 'Sin stock', color: 'text-red-500' }
  if (stock < 10) return { text: `Pocas piezas (${stock})`, color: 'text-orange-500' }
  return { text: `En stock (${stock} piezas)`, color: 'text-green-600' }
}

export default function ProductDetailClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [related, setRelated] = useState<RelatedProduct[]>([])

  const name = product.name as string
  const sku = product.sku as string
  const slug = product.slug as string
  const price = product.price as number | null
  const stock = product.stock as number | null
  const descMx = product.description_mx as string | null
  const brand = product.brand as string | null
  const capacity = product.capacity as string | null
  const material = product.material as string | null
  const measure = product.measure as string | null
  const dims = product.dimensions_json as Dimensions | null
  const weights = product.weights_json as Weight | null
  const imagesJson = product.images_json as MediaImages | null
  const variantsJson = product.variants_json as Variant[] | null
  const categorySlug = product.category_slug as string

  // Build gallery: mainImages + vectorImages
  const mainImages: string[] = imagesJson?.mainImages?.filter(Boolean) ?? []
  if (!mainImages.length && product.image_url) {
    mainImages.push(product.image_url as string)
  }
  const vectorImages: string[] = imagesJson?.vectorImages?.filter(Boolean) ?? []
  const allImages = [...mainImages, ...vectorImages]

  const waText = encodeURIComponent(`Hola, me interesa cotizar: ${name} (SKU: ${sku})`)
  const waLink = `https://wa.me/529512424333?text=${waText}`

  const stockInfo = stockLabel(stock)

  function handleAddToCart() {
    addItem({
      id: product.id as string,
      name,
      sku,
      price,
      image: mainImages[0] ?? '',
      slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  useEffect(() => {
    fetch(`/api/products/${slug}/related`)
      .then((r) => r.json())
      .then((d) => setRelated(d.products ?? []))
      .catch(() => {})
  }, [slug])

  // Build specs table
  const specs: Array<{ label: string; value: string }> = []
  if (brand) specs.push({ label: 'Marca', value: brand })
  if (capacity) specs.push({ label: 'Capacidad', value: capacity })
  if (material) specs.push({ label: 'Material', value: material })
  if (measure) specs.push({ label: 'Medidas', value: measure })
  if (dims?.heightInCentimeters) specs.push({ label: 'Alto', value: `${dims.heightInCentimeters} cm` })
  if (dims?.widthInCentimeters) specs.push({ label: 'Ancho', value: `${dims.widthInCentimeters} cm` })
  if (dims?.lengthInCentimeters) specs.push({ label: 'Largo', value: `${dims.lengthInCentimeters} cm` })
  if (dims?.individualBoxDimensions) specs.push({ label: 'Caja individual', value: dims.individualBoxDimensions })
  if (weights?.grossWeight) specs.push({ label: 'Peso bruto', value: `${weights.grossWeight} ${weights.unitWeight ?? 'kg'}` })
  if (weights?.netWeight) specs.push({ label: 'Peso neto', value: `${weights.netWeight} ${weights.unitWeight ?? 'kg'}` })

  // Collect variant colors
  const colors = variantsJson
    ? [...new Set(variantsJson.map((v) => v.color).filter(Boolean) as string[])]
    : []

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Productos</Link>
          {categorySlug && (
            <>
              <span>/</span>
              <Link
                href={`/productos?category=${categorySlug}`}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors capitalize"
              >
                {categorySlug}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">{name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver a productos
        </Link>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left: Gallery ─────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden aspect-square flex items-center justify-center group border border-zinc-100 dark:border-zinc-800">
              {allImages[activeImg] ? (
                <img
                  src={allImages[activeImg]}
                  alt={name}
                  className="w-full h-full object-contain p-4 transition-opacity duration-200"
                  style={{ maxHeight: 480 }}
                />
              ) : (
                <div className="text-zinc-300 dark:text-zinc-600 text-5xl font-bold select-none">?</div>
              )}
              {allImages.length > 0 && (
                <a
                  href={allImages[activeImg]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-white/80 dark:bg-zinc-800/80 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Ver imagen completa"
                >
                  <ZoomIn size={16} className="text-zinc-600 dark:text-zinc-300" />
                </a>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImg
                        ? 'border-zinc-800 dark:border-zinc-200'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}
                    aria-label={`Imagen ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1 bg-zinc-50 dark:bg-zinc-900" />
                  </button>
                ))}
              </div>
            )}

            {/* Vector download hint */}
            {vectorImages.length > 0 && (
              <a
                href={vectorImages[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-center text-zinc-500 dark:text-zinc-400 hover:underline"
              >
                Ver imagen vectorial →
              </a>
            )}
          </div>

          {/* ── Right: Product info ────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Title + SKU */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{name}</h1>
              <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">SKU: {sku}</p>
              {brand && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Marca: <span className="font-medium">{brand}</span></p>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {price ? (
                <>
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white">{formatPrice(price)}</span>
                  <span className="text-sm text-zinc-400">MXN + IVA</span>
                </>
              ) : (
                <span className="text-xl font-semibold text-zinc-500 dark:text-zinc-400">Consultar precio</span>
              )}
            </div>

            {/* Stock */}
            <div className={`text-sm font-medium ${stockInfo.color}`}>
              {stockInfo.text}
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Colores disponibles ({colors.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-full text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {descMx && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Descripción</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{descMx}</p>
              </div>
            )}

            {/* Specs table */}
            {specs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Especificaciones</h2>
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950'}>
                          <td className="px-4 py-2.5 font-medium text-zinc-600 dark:text-zinc-400 w-40">{s.label}</td>
                          <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200'
                }`}
                aria-label="Agregar al carrito"
              >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? '¡Agregado!' : 'Agregar al carrito'}
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-all duration-200"
                aria-label="Cotizar por WhatsApp"
              >
                <MessageCircle size={18} />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/producto/${r.slug}`}
                  className="group rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-zinc-900"
                >
                    <div className="flex items-center justify-center bg-[#F2F2F2] dark:bg-zinc-800 rounded-none h-[140px] p-4">
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={r.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="text-zinc-300 dark:text-zinc-600 text-3xl font-bold">?</div>
                      )}
                    </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">{r.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {r.price ? formatPrice(r.price) : 'Consultar'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
