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
  
  // New filters
  const colors = searchParams.get('color')?.split(',').filter(Boolean) || []
  const brands = searchParams.get('brand')?.split(',').filter(Boolean) || []
  const productTypes = searchParams.get('type')?.split(',').filter(Boolean) || []
  const capacities = searchParams.get('cap')?.split(',').filter(Boolean) || []
  const categoryIds = searchParams.get('cat')?.split(',').filter(Boolean) || []

  const sort = searchParams.get('sort') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)))
  const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('products')
      .select(
        'id, sku, name, slug, image_url, images_json, category_slug, api_category_id, price, price_mx, currency_mx, price_source, price_updated_at, stock, stock_status, stock_updated_at, colors, brand, product_type, capacity, created_at',
        { count: 'exact' }
      )
  
    if (category) {
      // 1. Try mapping for this site slug
      const { data: mapping } = await supabaseAdmin
        .from('category_mapping')
        .select('api_category_ids')
        .eq('site_slug', category)
        .single()

      if (mapping?.api_category_ids && Array.isArray(mapping.api_category_ids) && mapping.api_category_ids.length > 0) {
        // Filter by real API IDs
        query = query.in('api_category_id', mapping.api_category_ids)
      } else {
        // Fallback: filter directly by category_slug
        query = query.eq('category_slug', category)
      }
    }

  if (categoryIds.length > 0) {
    query = query.in('api_category_id', categoryIds)
  }

  if (colors.length > 0) {
    // colors is text[], we check if any of the requested colors are in the array
    query = query.overlaps('colors', colors.map(c => c.toUpperCase()))
  }

  if (brands.length > 0) {
    query = query.in('brand', brands)
  }

  if (productTypes.length > 0) {
    query = query.in('product_type', productTypes)
  }

  if (capacities.length > 0) {
    query = query.in('capacity', capacities)
  }


  if (q && !category) {
    // Global search: across name, product_type, brand, and sku
    const pattern = `%${q}%`
    query = query.or(`name.ilike.${pattern},product_type.ilike.${pattern},brand.ilike.${pattern},sku.ilike.${pattern}`)
  } else if (q && category) {
    // Category + subcategory search: try to narrow by q within the category
    // Split q into words and match any word in name
    const words = q.split(/\s+/).filter(Boolean)
    const nameFilters = words.map(w => `name.ilike.%${w}%`).join(',')
    query = query.or(nameFilters)
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

  // Default sort: by stock descending (mirrors promo catalog's "Posición" order)
  let orderCol = 'stock'
  let ascending = false
  let nullsFirst = false

  if (sort === 'newest') {
    orderCol = 'created_at'
    ascending = false
    nullsFirst = false
  } else if (sort === 'name') {
    orderCol = 'name'
    ascending = true
    nullsFirst = true
  } else if (sort === 'price_asc') {
    orderCol = 'price_mx'
    ascending = true
    nullsFirst = false
  } else if (sort === 'price_desc') {
    orderCol = 'price_mx'
    ascending = false
    nullsFirst = false
  }

  let { data, count, error } = await query
    .order(orderCol, { ascending, nullsFirst })
    .range(offset, offset + limit - 1)

  // Fallback: if category+q search yields 0 results, retry without q (show full category)
  if (!error && (count === 0 || !data?.length) && q && category) {
    let fallbackQuery = supabaseAdmin
      .from('products')
      .select(
        'id, sku, name, slug, image_url, images_json, category_slug, api_category_id, price, price_mx, currency_mx, price_source, price_updated_at, stock, stock_status, stock_updated_at, colors, brand, product_type, capacity, created_at',
        { count: 'exact' }
      )

    // Re-apply category filter
    const { data: fallbackMapping } = await supabaseAdmin
      .from('category_mapping')
      .select('api_category_ids')
      .eq('site_slug', category)
      .single()

    if (fallbackMapping?.api_category_ids?.length) {
      fallbackQuery = fallbackQuery.in('api_category_id', fallbackMapping.api_category_ids)
    } else {
      fallbackQuery = fallbackQuery.eq('category_slug', category)
    }

    if (HIDE_OUT_OF_STOCK && HIDE_IF_STOCK_UNKNOWN) {
      fallbackQuery = fallbackQuery.gt('stock', 0)
    } else if (HIDE_OUT_OF_STOCK) {
      fallbackQuery = fallbackQuery.or('stock.gt.0,stock.is.null')
    }

    const fallback = await fallbackQuery
      .order(orderCol, { ascending, nullsFirst })
      .range(offset, offset + limit - 1)

    if (!fallback.error) {
      data = fallback.data
      count = fallback.count
      error = fallback.error
    }
  }

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
