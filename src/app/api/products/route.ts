import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const offset = (page - 1) * limit

  let query = supabase.from('products').select('*', { count: 'exact' })

  if (tag === 'best_seller') {
    query = query.eq('is_best_seller', true)
  } else if (tag === 'recommended') {
    query = query.eq('is_recommended', true)
  } else if (category) {
    query = query.eq('category_slug', category)
  }

  query = query.range(offset, offset + limit - 1).order('name', { ascending: true })

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  })
}
