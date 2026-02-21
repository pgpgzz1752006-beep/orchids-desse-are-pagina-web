import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
  const offset = (page - 1) * limit

  if (!q) {
    return NextResponse.json({ products: [], total: 0, page, totalPages: 0 })
  }

  const { data, error, count } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, slug, image_url, category_slug, price, stock', { count: 'exact' })
    .ilike('name', `%${q}%`)
    .range(offset, offset + limit - 1)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = count ?? 0
  return NextResponse.json({
    products: data ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
