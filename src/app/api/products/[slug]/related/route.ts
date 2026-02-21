import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // First get the current product's category
  const { data: current } = await supabaseAdmin
    .from('products')
    .select('id, category_slug')
    .eq('slug', slug)
    .single()

  if (!current) {
    return NextResponse.json({ products: [] })
  }

  const { data } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, slug, image_url, category_slug, price')
    .eq('category_slug', current.category_slug)
    .neq('id', current.id)
    .not('slug', 'is', null)
    .order('name', { ascending: true })
    .limit(8)

  return NextResponse.json({ products: data ?? [] })
}
