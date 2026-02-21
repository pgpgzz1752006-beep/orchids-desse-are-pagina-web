import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductDetailClient from './ProductDetailClient'

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

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, slug, description, image_url, category_slug, raw_category, price, stock')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Product
}

async function getRelated(categorySlug: string, currentId: string): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, slug, image_url, category_slug, price')
    .eq('category_slug', categorySlug)
    .neq('id', currentId)
    .not('slug', 'is', null)
    .order('name', { ascending: true })
    .limit(8)

  return (data as Product[]) ?? []
}

/** Auto-generate a short neutral description from product name + category */
function autoDescription(name: string, category: string | null): string {
  const cat = category?.toLowerCase() ?? 'promocional'
  return `${name} es un artículo ${cat} ideal para personalizar con tu marca o logo. Disponible para pedidos corporativos y regalos empresariales.`
}

/** Parse image url that may be stored as a JSON array string */
function parseImageUrl(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed) as unknown[]
      const first = arr[0]
      if (typeof first === 'string' && first.startsWith('http')) return first
    } catch { /* ignore */ }
  }
  if (trimmed.startsWith('http')) return trimmed
  return null
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Producto no encontrado | Diseñare Promocionales' }

  const desc = product.description || autoDescription(product.name, product.raw_category)
  const image = parseImageUrl(product.image_url)

  return {
    title: `${product.name} | Diseñare Promocionales`,
    description: desc.slice(0, 160),
    openGraph: {
      title: product.name,
      description: desc.slice(0, 160),
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelated(product.category_slug, product.id)

  const description = product.description || autoDescription(product.name, product.raw_category)
  const imageUrl = parseImageUrl(product.image_url)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0F12] font-['Montserrat'] transition-colors duration-300">
        <ProductDetailClient
        product={{ ...product, description, image_url: imageUrl }}
        related={related}
      />
      <Footer lineHeight={3} />
      <WhatsAppButton />
    </div>
  )
}
