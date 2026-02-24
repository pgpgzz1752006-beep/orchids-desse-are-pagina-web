import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // Get the product's category to find related items
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
    .select('id, sku, name, slug, image_url, category_slug, price, price_mx')
    .eq('category_slug', current.category_slug)
    .neq('id', current.id)
    .gt('stock', 0)          // only products with confirmed stock
    .not('image_url', 'is', null)
    .order('name', { ascending: true })
    .limit(8)

  const products = (data ?? []).map((r) => ({
    ...r,
    price: (r.price_mx ?? r.price) as number | null,
  }))

  return NextResponse.json({ products })
}
