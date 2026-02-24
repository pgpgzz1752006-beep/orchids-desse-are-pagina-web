/**
 * GET /api/admin/price-audit?sku=XXXX
 *
 * Returns:
 *  - price stored in DB (price_mx)
 *  - price fetched live from GraphQL API
 *  - raw amount string from API
 *  - difference
 *  - which field was used (priceMx.amount)
 *  - whether the DB price is stale
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, CatalogPage, PromoProduct, parseApiPrice, bestVariantPrice } from '@/lib/promoClient'

const PRICE_STALE_MS = 24 * 60 * 60 * 1000

async function findProductInApi(sku: string): Promise<PromoProduct | null> {
  try {
    const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
    const totalPages = page1.distribuitorProductCatalog.totalPages

    const match = (data: PromoProduct[]) =>
      data.find((p) => p.productModel.sku === sku || p.variants.some((v) => v.sku === sku))

    const found = match(page1.distribuitorProductCatalog.data)
    if (found) return found

    for (let p = 2; p <= totalPages; p++) {
      const res = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: p })
      const f = match(res.distribuitorProductCatalog.data)
      if (f) return f
    }
    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get('sku')?.trim().toUpperCase()

  if (!sku) {
    return NextResponse.json({ error: 'Missing ?sku= parameter' }, { status: 400 })
  }

  // 1. DB lookup
  const { data: dbRow } = await supabaseAdmin
    .from('products')
    .select('sku, name, price, price_mx, currency_mx, price_raw, price_source, price_updated_at')
    .eq('sku', sku)
    .single()

  const dbPrice = dbRow ? ((dbRow.price_mx ?? dbRow.price) as number | null) : null
  const priceUpdatedAt = dbRow?.price_updated_at as string | null
  const priceStale = !priceUpdatedAt ||
    (Date.now() - new Date(priceUpdatedAt).getTime()) > PRICE_STALE_MS

  // 2. Live API lookup
  const apiProduct = await findProductInApi(sku)

  let apiPrice: number | null = null
  let apiRaw: string | null = null
  let apiCurrency = 'MXN'
  let variantBreakdown: Array<{ sku: string; amount: string; parsed: number | null; sentinel: boolean }> = []

  if (apiProduct) {
    const best = bestVariantPrice(apiProduct.variants)
    apiPrice = best.price
    apiRaw = best.raw
    apiCurrency = best.currency

    // Build per-variant breakdown for debugging
    variantBreakdown = (apiProduct.variants ?? []).map((v) => {
      const priceMxArr = v.pricing?.priceMx
      const rawAmount = priceMxArr?.[0]?.amount ?? 'N/A'
      const parsed = parseApiPrice(priceMxArr)
      return {
        sku: v.sku,
        amount: rawAmount,
        parsed: parsed.price,
        sentinel: parsed.price === null && rawAmount !== 'N/A',
      }
    })
  }

  const difference = apiPrice !== null && dbPrice !== null
    ? Math.round((apiPrice - dbPrice) * 100) / 100
    : null

  return NextResponse.json({
    sku,
    found_in_db: !!dbRow,
    found_in_api: !!apiProduct,
    db: {
      price_mx: dbPrice,
      currency_mx: (dbRow?.currency_mx as string | null) ?? 'MXN',
      price_raw: dbRow?.price_raw ?? null,
      price_source: (dbRow?.price_source as string | null) ?? null,
      price_updated_at: priceUpdatedAt,
      is_stale: priceStale,
    },
    api: {
      price_mx: apiPrice,
      currency: apiCurrency,
      price_raw: apiRaw,
      field_used: 'priceMx[0].amount',
      variants: variantBreakdown,
    },
    difference,
    match: difference === 0,
  })
}
