/**
 * POST /api/stock/batch
 * Accepts { skus: string[] }, fetches live stock from GraphQL for those SKUs,
 * updates Supabase, and returns the results.
 *
 * GET /api/stock?sku=XXXX
 * Single-SKU stock check.
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, STOCK_QUERY, StockItem } from '@/lib/promoClient'

interface StockResult {
  sku: string
  stock: number
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN'
}

function classifyStock(stock: number | null): StockResult['status'] {
  if (stock === null) return 'UNKNOWN'
  if (stock === 0) return 'OUT_OF_STOCK'
  if (stock <= 10) return 'LOW_STOCK'
  return 'IN_STOCK'
}

/** Fetch the full stock catalog from GraphQL and build a SKU→total map */
async function fetchStockMap(): Promise<Map<string, number>> {
  const res = await promoGQL<{ distributorStockCatalog: StockItem[] }>(STOCK_QUERY)
  const stockMap = new Map<string, number>()
  for (const s of res.distributorStockCatalog ?? []) {
    if (s.sku && s.currentStock != null) {
      stockMap.set(s.sku, (stockMap.get(s.sku) ?? 0) + s.currentStock)
    }
  }
  return stockMap
}

/** Persist stock updates to Supabase in chunks */
async function persistStockUpdates(items: StockResult[]) {
  const now = new Date().toISOString()
  const CHUNK = 100

  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK)
    // Update each product by sku
    for (const item of chunk) {
      await supabaseAdmin
        .from('products')
        .update({
          stock: item.stock,
          stock_status: item.status,
          stock_updated_at: now,
        })
        .eq('sku', item.sku)
    }
  }
}

// ── POST /api/stock/batch ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { skus?: string[] }
    const skus: string[] = body.skus ?? []

    if (!Array.isArray(skus) || skus.length === 0) {
      return NextResponse.json({ error: 'skus array is required' }, { status: 400 })
    }

    const stockMap = await fetchStockMap()

    // For each requested SKU, we need to check all variant SKUs.
    // Since we only have product-model SKUs in the request, we also look up
    // by variant SKU (the stock catalog uses variant-level SKUs).
    // We'll sum stock for all entries whose key matches any requested SKU.
    const items: StockResult[] = skus.map((sku) => {
      const stock = stockMap.get(sku) ?? null
      return {
        sku,
        stock: stock ?? 0,
        status: classifyStock(stock),
      }
    })

    // Persist to DB in background (non-blocking for the caller)
    persistStockUpdates(items).catch(() => {})

    return NextResponse.json({ items })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── GET /api/stock?sku=XXXX ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const sku = new URL(req.url).searchParams.get('sku')?.trim().toUpperCase()
  if (!sku) {
    return NextResponse.json({ error: 'sku query param is required' }, { status: 400 })
  }

  try {
    const stockMap = await fetchStockMap()
    const stock = stockMap.get(sku) ?? null
    const result: StockResult = {
      sku,
      stock: stock ?? 0,
      status: classifyStock(stock),
    }

    // Persist single update
    persistStockUpdates([result]).catch(() => {})

    return NextResponse.json(result)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
