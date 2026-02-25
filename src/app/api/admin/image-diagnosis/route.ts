import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, CatalogPage, PromoProduct } from '@/lib/promoClient'

function cleanList(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  const seen = new Set<string>()
  return arr
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0 && !seen.has(s) && (seen.add(s), true))
}

export async function GET(req: NextRequest) {
  const sku = req.nextUrl.searchParams.get('sku')?.trim().toUpperCase()
  if (!sku) {
    return NextResponse.json({ error: 'Missing sku param' }, { status: 400 })
  }

  // ── 1. DB snapshot ──────────────────────────────────────────────────────────
  const { data: dbRow } = await supabaseAdmin
    .from('products')
    .select('sku, slug, image_url, images_json, details_synced_at')
    .eq('sku', sku)
    .single()

  const dbMain = cleanList((dbRow?.images_json as Record<string,unknown> | null)?.mainImages)
  const dbVec  = cleanList((dbRow?.images_json as Record<string,unknown> | null)?.vectorImages)

  // ── 2. Live API hit ─────────────────────────────────────────────────────────
  let apiMain: string[] = []
  let apiVec:  string[] = []
  let apiError: string | null = null
  let apiPageScanned = 0

  try {
    const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
    const total  = page1.distribuitorProductCatalog.totalPages

    const findProduct = (data: PromoProduct[]) =>
      data.find((p) => p.productModel.sku === sku || p.variants.some((v) => v.sku === sku))

    let found = findProduct(page1.distribuitorProductCatalog.data)
    apiPageScanned = 1

    if (!found) {
      for (let p = 2; p <= total; p++) {
        apiPageScanned = p
        const res = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: p })
        found = findProduct(res.distribuitorProductCatalog.data)
        if (found) break
      }
    }

    if (found) {
      apiMain = cleanList(found.productModel.media?.mainImages)
      apiVec  = cleanList(found.productModel.media?.vectorImages)
    } else {
      apiError = 'SKU not found in API catalog'
    }
  } catch (e) {
    apiError = e instanceof Error ? e.message : 'GraphQL error'
  }

  return NextResponse.json({
    sku,
    slug: dbRow?.slug ?? null,
    found_in_db: !!dbRow,
    found_in_api: apiMain.length > 0 || apiVec.length > 0,
    api_pages_scanned: apiPageScanned,
    api_error: apiError,
    db: {
      main_images_count: dbMain.length,
      vector_images_count: dbVec.length,
      main_images: dbMain,
      vector_images: dbVec,
      synced_at: dbRow?.details_synced_at ?? null,
    },
    api: {
      main_images_count: apiMain.length,
      vector_images_count: apiVec.length,
      main_images: apiMain,
      vector_images: apiVec,
    },
  })
}
