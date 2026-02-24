/**
 * POST /api/validate-quantity
 * Body: { sku: string, requestedQty: number }
 * Returns:
 *   { ok: true, available: number }
 *   { ok: false, reason: "INSUFFICIENT_STOCK" | "OUT_OF_STOCK" | "UNKNOWN_STOCK", available: number | null }
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { sku?: string; requestedQty?: unknown }
    const sku = typeof body.sku === 'string' ? body.sku.trim().toUpperCase() : ''
    const requestedQty = typeof body.requestedQty === 'number' ? Math.floor(body.requestedQty) : NaN

    if (!sku) {
      return NextResponse.json({ error: 'sku is required' }, { status: 400 })
    }
    if (isNaN(requestedQty) || requestedQty < 1) {
      return NextResponse.json({ error: 'requestedQty must be a positive integer' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('sku', sku)
      .single()

    if (error || !data) {
      return NextResponse.json({ ok: false, reason: 'PRODUCT_NOT_FOUND', available: null }, { status: 404 })
    }

    const stock = data.stock as number | null

    // Unknown stock — cannot confirm
    if (stock === null) {
      return NextResponse.json({ ok: false, reason: 'UNKNOWN_STOCK', available: null })
    }

    // No stock at all
    if (stock <= 0) {
      return NextResponse.json({ ok: false, reason: 'OUT_OF_STOCK', available: 0 })
    }

    // Insufficient stock
    if (requestedQty > stock) {
      return NextResponse.json({ ok: false, reason: 'INSUFFICIENT_STOCK', available: stock })
    }

    return NextResponse.json({ ok: true, available: stock })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
