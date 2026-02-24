/**
 * GET /api/admin/stock-stats
 * Returns aggregate stock counts from the products table.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('stock')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []
  const total = rows.length
  const with_stock = rows.filter((r) => r.stock !== null && r.stock > 0).length
  const out_of_stock = rows.filter((r) => r.stock !== null && r.stock === 0).length
  const unknown = rows.filter((r) => r.stock === null).length

  return NextResponse.json({ total, with_stock, out_of_stock, unknown })
}
