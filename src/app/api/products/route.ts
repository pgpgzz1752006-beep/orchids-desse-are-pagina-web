import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 100

// Global stock-filtering flags
const HIDE_OUT_OF_STOCK = true
const HIDE_IF_STOCK_UNKNOWN = true

// Stale threshold: refresh stock in background if > 6 hours old
const STOCK_STALE_MS = 6 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)))
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('products')
    .select(
      'id, sku, name, slug, image_url, category_slug, price, price_mx, currency_mx, price_source, price_updated_at, stock, stock_status, stock_updated_at',
      { count: 'exact' }
    )

  if (category) {
    query = query.eq('category_slug', category)
  }

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  if (tag === 'best_seller') {
    query = query.eq('is_best_seller', true)
  } else if (tag === 'recommended') {
    query = query.eq('is_recommended', true)
  }

  // ── Stock filtering (server-side — never leaks to frontend) ──────────────
  if (HIDE_OUT_OF_STOCK && HIDE_IF_STOCK_UNKNOWN) {
    // Only products where stock is explicitly > 0
    query = query.gt('stock', 0)
  } else if (HIDE_OUT_OF_STOCK && !HIDE_IF_STOCK_UNKNOWN) {
    // Show products with stock > 0 OR stock is unknown (null)
    query = query.or('stock.gt.0,stock.is.null')
  }
  // If HIDE_OUT_OF_STOCK=false → no filter (show everything)

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Background stale-stock refresh (non-blocking)
  triggerStaleStockRefresh(data ?? []).catch(() => {})

  // Normalize: always expose price_mx as the canonical price field
  const products = (data ?? []).map((row) => ({
    ...row,
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

/**
 * Fire-and-forget: for any products whose stock_updated_at is stale,
 * trigger a batch stock refresh via the internal /api/stock/batch endpoint.
 */
async function triggerStaleStockRefresh(rows: Array<{ sku: string; stock_updated_at?: string | null }>) {
  const now = Date.now()
  const staleSkus = rows
    .filter((r) => {
      const updatedAt = r.stock_updated_at
      if (!updatedAt) return true
      return now - new Date(updatedAt).getTime() > STOCK_STALE_MS
    })
    .map((r) => r.sku)

  if (staleSkus.length === 0) return

  try {
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}/api/stock/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skus: staleSkus }),
    })
  } catch {
    // non-blocking — ignore errors
  }
}
