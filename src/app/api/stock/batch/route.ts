/**
 * POST /api/stock/batch
 * Accepts { skus: string[] } (product-model SKUs),
 * resolves variant-level SKUs from variants_json in DB,
 * fetches live stock from GraphQL, updates Supabase, returns results.
 *
 * GET /api/stock?sku=XXXX  →  handled by /api/stock/route.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, STOCK_QUERY, StockItem } from '@/lib/promoClient'

interface VariantSku { sku: string }

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN'

interface StockResult {
  sku: string
  stock: number
  status: StockStatus
}

function classifyStock(stock: number | null): StockStatus {
  if (stock === null) return 'UNKNOWN'
  if (stock === 0) return 'OUT_OF_STOCK'
  if (stock <= 10) return 'LOW_STOCK'
  return 'IN_STOCK'
}

/** Fetch full stock catalog from GraphQL → map variantSku → total stock */
async function fetchStockMap(): Promise<Map<string, number>> {
  const res = await promoGQL<{ distributorStockCatalog: StockItem[] }>(STOCK_QUERY)
  const map = new Map<string, number>()
  for (const s of res.distributorStockCatalog ?? []) {
    if (s.sku && s.currentStock != null) {
      map.set(s.sku, (map.get(s.sku) ?? 0) + s.currentStock)
    }
  }
  return map
}

// ── POST /api/stock/batch ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { skus?: string[] }
    const skus: string[] = Array.isArray(body.skus) ? body.skus : []

    if (skus.length === 0) {
      return NextResponse.json({ error: 'skus array is required' }, { status: 400 })
    }

    // Fetch full stock map from API (one request for all variant SKUs)
    const stockMap = await fetchStockMap()

    // Look up variants_json for each product model SKU to get variant-level SKUs
    const { data: productRows } = await supabaseAdmin
      .from('products')
      .select('sku, variants_json')
      .in('sku', skus)

    const now = new Date().toISOString()
    const items: StockResult[] = []

    // Build model-sku → total stock by summing all variant-level entries
    const CHUNK = 50
    const updates: Array<{ sku: string; stock: number; stock_status: StockStatus; stock_updated_at: string }> = []

    for (const sku of skus) {
      const row = productRows?.find((r) => r.sku === sku)
      let totalStock = 0

      if (row?.variants_json && Array.isArray(row.variants_json)) {
        // Sum stock across all variant SKUs for this product model
        for (const v of row.variants_json as VariantSku[]) {
          if (v?.sku) {
            totalStock += stockMap.get(v.sku) ?? 0
          }
        }
      } else {
        // Fallback: try model SKU directly in stock map
        totalStock = stockMap.get(sku) ?? 0
      }

      const status = classifyStock(totalStock)
      items.push({ sku, stock: totalStock, status })
      updates.push({ sku, stock: totalStock, stock_status: status, stock_updated_at: now })
    }

    // Persist updates in background (non-blocking)
    ;(async () => {
      for (let i = 0; i < updates.length; i += CHUNK) {
        const chunk = updates.slice(i, i + CHUNK)
        await Promise.all(
          chunk.map((u) =>
            supabaseAdmin
              .from('products')
              .update({ stock: u.stock, stock_status: u.stock_status, stock_updated_at: u.stock_updated_at })
              .eq('sku', u.sku)
          )
        )
      }
    })().catch(() => {})

    return NextResponse.json({ items })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
