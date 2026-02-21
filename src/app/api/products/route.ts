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
    .select('id, sku, name, slug, image_url, category_slug, price, stock', { count: 'exact' })

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

  const total = count ?? 0
  return NextResponse.json({
    products: data ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
