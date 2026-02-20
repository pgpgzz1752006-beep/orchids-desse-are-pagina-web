import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const offset = (page - 1) * limit

  if (!q) {
    return NextResponse.json({ products: [], total: 0, page, limit, totalPages: 0 })
  }

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .ilike('name', `%${q}%`)
    .range(offset, offset + limit - 1)
    .order('name', { ascending: true })

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
