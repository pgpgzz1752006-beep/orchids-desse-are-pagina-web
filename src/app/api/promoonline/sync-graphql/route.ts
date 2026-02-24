/**
 * POST /api/promoonline/sync-graphql
 * Fetches ALL pages from distribuitorProductCatalog + stock,
 * then upserts into Supabase products table with full detail fields.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, STOCK_QUERY, CatalogPage, StockItem, PromoProduct } from '@/lib/promoClient'
import { mapToSlug, makeProductSlug } from '@/lib/categoryMapper'

const CHUNK = 200

function firstPrice(product: PromoProduct): number | null {
  for (const v of product.variants ?? []) {
    const prices = v.pricing?.priceMx
    if (prices?.length) {
      const n = parseFloat(prices[0].amount)
      if (!isNaN(n) && n > 0) return n
    }
  }
  return null
}

export async function POST() {
  try {
    // 1. Fetch all catalog pages
    const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
    const catalog1 = page1.distribuitorProductCatalog
    let allProducts: PromoProduct[] = [...catalog1.data]

    for (let p = 2; p <= catalog1.totalPages; p++) {
      const res = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: p })
      allProducts = allProducts.concat(res.distribuitorProductCatalog.data)
    }

    // 2. Fetch stock map
    const stockRes = await promoGQL<{ distributorStockCatalog: StockItem[] }>(STOCK_QUERY)
    const stockMap = new Map<string, number>()
    for (const s of stockRes.distributorStockCatalog ?? []) {
      if (s.sku && s.currentStock != null) {
        const existing = stockMap.get(s.sku) ?? 0
        stockMap.set(s.sku, existing + s.currentStock)
      }
    }

    // 3. Build upsert rows
    const now = new Date().toISOString()
    const rows = allProducts.map((product) => {
      const pm = product.productModel
      const name = pm.nameProductModel
      const sku = pm.sku
      const mainImage = pm.media?.mainImages?.[0] ?? null
      const categorySlug = mapToSlug(name, '')
      const price = firstPrice(product)

      // Sum stock across all variant SKUs
      let totalStock = 0
      for (const v of product.variants ?? []) {
        totalStock += stockMap.get(v.sku) ?? 0
      }

      return {
        sku,
        name,
        slug: makeProductSlug(name, sku),
        image_url: mainImage,
        category_slug: categorySlug,
        raw_category: '',
        price,
        stock: totalStock || null,
        description_mx: pm.descriptionMx ?? null,
        brand: pm.brand ?? null,
        capacity: pm.capacity ?? null,
        material: pm.features?.material ?? null,
        measure: pm.features?.measure ?? null,
        dimensions_json: pm.package?.dimensions ?? null,
        weights_json: pm.package?.weight ?? null,
        images_json: pm.media ?? null,
        variants_json: product.variants ?? null,
        details_synced_at: now,
        updated_at: now,
        is_best_seller: false,
        is_recommended: false,
      }
    })

    // 4. Upsert in chunks
    let upserted = 0
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(chunk, { onConflict: 'sku', ignoreDuplicates: false })
        .select('id')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      upserted += data?.length ?? 0
    }

    return NextResponse.json({
      ok: true,
      total: rows.length,
      upserted,
      pages: catalog1.totalPages,
    })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
