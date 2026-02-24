import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

  if (!data) notFound()

  return <ProductDetailClient product={data as Record<string, unknown>} />
}
