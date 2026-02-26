import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { applyMarkup } from '@/lib/pricing'

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
        'id, sku, name, slug, image_url, category_slug, api_category_id, price, price_mx, currency_mx, price_source, price_updated_at, stock, stock_status, stock_updated_at',
        { count: 'exact' }
      )
  
    if (category) {
      // 1. Fetch mapping for this site slug
      const { data: mapping } = await supabaseAdmin
        .from('category_mapping')
        .select('api_category_ids')
        .eq('site_slug', category)
        .single()

      if (mapping?.api_category_ids && Array.isArray(mapping.api_category_ids) && mapping.api_category_ids.length > 0) {
        // Filter by real API IDs
        query = query.in('api_category_id', mapping.api_category_ids)
      } else {
        // Fallback or explicit empty result if mapping missing
        // According to requirements: "Si no hay mapeo configurado... devolver lista vacía"
        console.warn(`[products] No mapping found for category: ${category}`)
        return NextResponse.json({
          products: [],
          total: 0,
          page,
          totalPages: 0,
          error: `Falta mapear categoría: ${category}`
        })
      }
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

  // Normalize: expose base_price (raw from DB) and price (with 35% markup)
  const products = (data ?? []).map((row) => {
    const base = (row.price_mx ?? row.price) as number | null
    return {
      ...row,
      base_price: base,
      price: applyMarkup(base),
      price_mx: applyMarkup(base),
      currency_mx: (row.currency_mx as string | null) ?? 'MXN',
      price_source: (row.price_source as string | null) ?? 'api',
    }
  })

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
