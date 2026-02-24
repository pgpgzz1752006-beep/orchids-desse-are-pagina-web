import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 100

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('products')
    .select(
      'id, sku, name, slug, image_url, category_slug, price, price_mx, currency_mx, price_source, price_updated_at, stock',
      { count: 'exact' }
    )

  if (category) {
    query = query.eq('category_slug', category)
  }

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Normalize: always expose price_mx as the canonical price field
  const products = (data ?? []).map((row) => ({
    ...row,
    // price_mx is the source of truth; fall back to legacy price column
    price: (row.price_mx ?? row.price) as number | null,
    price_mx: (row.price_mx ?? row.price) as number | null,
    currency_mx: (row.currency_mx as string | null) ?? 'MXN',
    price_source: (row.price_source as string | null) ?? 'api',
  }))

  const total = count ?? 0
  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
