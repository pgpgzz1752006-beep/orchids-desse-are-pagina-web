'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, ChevronLeft, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'
import ProductGallery from '@/components/ProductGallery'

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

/** Normalise image list: remove falsy / whitespace-only, deduplicate, trim */
function cleanImages(arr: string[] | undefined | null): string[] {
  if (!arr) return []
  const seen = new Set<string>()
  return arr
    .map((s) => s?.trim())
    .filter((s): s is string => !!s && !seen.has(s) && (seen.add(s), true))
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function ProductDetailClient({ product }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [related, setRelated] = useState<RelatedProduct[]>([])

  // Quantity stepper
  const [qty, setQty] = useState(1)
  const [stockError, setStockError] = useState<string | null>(null)
  const [ctaBlocked, setCtaBlocked] = useState(false)

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

  // ── Build gallery arrays ──────────────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState<{ main: string[]; vector: string[] }>(() => {
    const main = cleanImages(imagesJson?.mainImages)
    if (!main.length && product.image_url) main.push(product.image_url as string)
    return { main, vector: cleanImages(imagesJson?.vectorImages) }
  })

  // Fetch fresh images from the API (triggers background GraphQL sync)
  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const fresh = d as { images_json?: { mainImages?: string[]; vectorImages?: string[] }; image_url?: string }
        const freshMain = cleanImages(fresh.images_json?.mainImages)
        if (!freshMain.length && fresh.image_url) freshMain.push(fresh.image_url)
        const freshVector = cleanImages(fresh.images_json?.vectorImages)
        if (freshMain.length > galleryImages.main.length || freshVector.length > galleryImages.vector.length) {
          setGalleryImages({ main: freshMain, vector: freshVector })
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const mainImages = galleryImages.main
  const vectorImages = galleryImages.vector

  const stockInfo = stockLabel(stock)

  // ── Quantity validation ───────────────────────────────────────────────────
  const validateQty = useCallback(
    (value: number) => {
      if (stock === null) {
        setStockError(null)
        setCtaBlocked(false)
        return
      }
      if (stock <= 0) {
        setStockError('Este producto no tiene stock disponible.')
        setCtaBlocked(true)
        return
      }
      if (value > stock) {
        setStockError(`No hay suficientes unidades para tu pedido. Disponible: ${stock}.`)
        setCtaBlocked(true)
        return
      }
      setStockError(null)
      setCtaBlocked(false)
    },
    [stock]
  )

  useEffect(() => {
    validateQty(qty)
  }, [qty, validateQty])

  function changeQty(delta: number) {
    setQty((prev) => {
      const max = stock != null && stock > 0 ? stock : 9999
      return Math.min(Math.max(prev + delta, 1), max)
    })
  }

  function handleInputQty(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val)) return
    const max = stock != null && stock > 0 ? stock : 9999
    setQty(Math.min(Math.max(val, 1), max))
  }

    // ── Add to cart + navigate ────────────────────────────────────────────────
  async function handleGoToCart() {
    if (ctaBlocked) return
    // Backend validation before adding
    try {
      const res = await fetch('/api/validate-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, requestedQty: qty }),
      })
      const data = (await res.json()) as {
        ok: boolean
        reason?: string
        available?: number | null
      }
      if (!data.ok) {
        if (data.reason === 'INSUFFICIENT_STOCK' && data.available != null) {
          setStockError(
            `No hay suficientes unidades para tu pedido. Disponible: ${data.available}.`
          )
          setQty(data.available)
        } else if (data.reason === 'OUT_OF_STOCK') {
          setStockError('Este producto no tiene stock disponible.')
        }
        if (data.reason !== 'UNKNOWN_STOCK') return
      }
    } catch {
      // network error — still allow
    }
    addItem(
      {
        id: product.id as string,
        name,
        sku,
        price,
        image: mainImages[0] ?? '',
        slug,
      },
      qty
    )
    router.push('/carrito')
  }

  useEffect(() => {
    fetch(`/api/products/${slug}/related`)
      .then((r) => r.json())
      .then((d) => setRelated(d.products ?? []))
      .catch(() => {})
  }, [slug])

  // ── Specs ─────────────────────────────────────────────────────────────────
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

  const colors = variantsJson
    ? ([...new Set(variantsJson.map((v) => v.color).filter(Boolean))] as string[])
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
        {/* Back */}
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Volver a productos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── LEFT: Gallery ────────────────────────────────────────── */}
          <div>
            <ProductGallery
              name={name}
              mainImages={mainImages}
              vectorImages={vectorImages}
            />
          </div>

          {/* ── RIGHT: Product info ───────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Title + SKU */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{name}</h1>
              <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">SKU: {sku}</p>
              {brand && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Marca: <span className="font-medium">{brand}</span>
                </p>
              )}
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

            {/* Stock label */}
            <div className={`text-sm font-medium ${stockInfo.color}`}>{stockInfo.text}</div>

            {/* ── Quantity stepper ──────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Cantidad
              </label>
              <div className="flex items-center w-fit rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <button
                  onClick={() => changeQty(-1)}
                  disabled={qty <= 1}
                  aria-label="Reducir cantidad"
                  className="flex items-center justify-center w-11 h-11 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  max={stock != null && stock > 0 ? stock : undefined}
                  onChange={handleInputQty}
                  aria-label="Cantidad"
                  className="w-14 h-11 text-center text-sm font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border-x border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#14C6C9]/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  onClick={() => changeQty(1)}
                  disabled={stock != null && stock > 0 ? qty >= stock : false}
                  aria-label="Aumentar cantidad"
                  className="flex items-center justify-center w-11 h-11 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Stock error banner */}
              <div
                aria-live="polite"
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  stockError ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'
                }`}
              >
                {stockError && (
                  <p className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {stockError}
                  </p>
                )}
              </div>

              {/* Unknown stock notice */}
              {stock === null && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Stock no confirmado. Te confirmamos disponibilidad por WhatsApp.
                </p>
              )}
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

            {/* Specs */}
            {specs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Especificaciones</h2>
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map((s, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-zinc-50 dark:bg-zinc-900' : 'bg-white dark:bg-zinc-950'}
                        >
                          <td className="px-4 py-2.5 font-medium text-zinc-600 dark:text-zinc-400 w-40">
                            {s.label}
                          </td>
                          <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={handleGoToCart}
                disabled={ctaBlocked}
                aria-label="Ir al carrito"
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  ctaBlocked
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart size={18} />
                Ir al Carrito
              </button>
            </div>
          </div>
        </div>

        {/* ── Related products ─────────────────────────────────────────────── */}
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
                  <div className="flex items-center justify-center bg-[#F2F2F2] dark:bg-zinc-800 h-[140px] p-4">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-zinc-300 dark:text-zinc-600 text-3xl font-bold">?</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">
                      {r.name}
                    </p>
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
