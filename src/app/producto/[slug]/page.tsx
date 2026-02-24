import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import ProductDetailClient from './ProductDetailClient'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('name, description_mx, image_url')
    .eq('slug', params.slug)
    .single()

  if (!data) return { title: 'Producto | Diseñare Promocionales' }

  return {
    title: `${data.name} | Diseñare Promocionales`,
    description: data.description_mx?.slice(0, 160) ?? `${data.name} - Diseñare Promocionales`,
    openGraph: {
      title: data.name,
      description: data.description_mx ?? data.name,
      images: data.image_url ? [{ url: data.image_url }] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single()

  // Product not found at all
  if (!data) {
    return <UnavailablePage />
  }

  // Product exists but has no stock (stock = 0, explicitly out of stock)
  // null = unknown (product may not have been synced yet — show it)
  const stock = data.stock as number | null
  if (stock !== null && stock <= 0) {
    return <UnavailablePage productName={data.name as string} />
  }

  return <ProductDetailClient product={data as Record<string, unknown>} />
}

function UnavailablePage({ productName }: { productName?: string }) {
  return (
    <div className="min-h-screen bg-[#0E0F12] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Producto no disponible</h1>
          {productName && (
            <p className="text-zinc-400 text-sm mb-1 font-medium">{productName}</p>
          )}
          <p className="text-zinc-500 text-sm">
            Este producto no cuenta con existencias en este momento. Consulta nuestro catálogo para ver productos disponibles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 bg-[#14C6C9] hover:bg-[#11b3b6] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wider"
          >
            Ver productos disponibles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
