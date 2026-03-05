/**
 * GET /api/stock?sku=XXXX
 * Single-SKU stock check. Returns { sku, stock, status }.
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, STOCK_QUERY, StockItem } from '@/lib/promoClient'

function classifyStock(stock: number | null): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' {
  if (stock === null) return 'UNKNOWN'
  if (stock === 0) return 'OUT_OF_STOCK'
  if (stock <= 10) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export async function GET(req: NextRequest) {
  const sku = new URL(req.url).searchParams.get('sku')?.trim().toUpperCase()
  if (!sku) {
    return NextResponse.json({ error: 'sku query param is required' }, { status: 400 })
  }

  try {
    const res = await promoGQL<{ distributorStockCatalog: StockItem[] }>(STOCK_QUERY)
    if (!res) {
      return NextResponse.json({ sku, stock: 0, status: 'UNKNOWN', error: 'API unavailable' }, { status: 200 })
    }
    const stockMap = new Map<string, number>()
    for (const s of res.distributorStockCatalog ?? []) {
      if (s.sku && s.currentStock != null) {
        stockMap.set(s.sku, (stockMap.get(s.sku) ?? 0) + s.currentStock)
      }
    }

    const stock = stockMap.get(sku) ?? null
    const result = { sku, stock: stock ?? 0, status: classifyStock(stock) }

    // Persist in background
    void supabaseAdmin
      .from('products')
      .update({ stock: result.stock, stock_status: result.status, stock_updated_at: new Date().toISOString() })
      .eq('sku', sku)

    return NextResponse.json(result)
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
