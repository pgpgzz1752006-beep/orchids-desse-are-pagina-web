/**
 * POST /api/promoonline/sync-graphql
 * Fetches ALL pages from distribuitorProductCatalog + stock,
 * then upserts into Supabase products table with full detail fields.
 */
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, STOCK_QUERY, CatalogPage, StockItem, PromoProduct, bestVariantPrice } from '@/lib/promoClient'
import { mapToSlug, makeProductSlug } from '@/lib/categoryMapper'

const CHUNK = 200

function classifyStock(total: number): string {
  if (total > 10) return 'IN_STOCK'
  if (total > 0) return 'LOW_STOCK'
  return 'OUT_OF_STOCK'
}

export async function POST() {
  try {
      // 1. Fetch all catalog pages
      const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
      if (!page1) return NextResponse.json({ ok: false, error: 'Promo API unavailable' }, { status: 503 })
      const catalog1 = page1.distribuitorProductCatalog
      let allProducts: PromoProduct[] = [...catalog1.data]

      for (let p = 2; p <= catalog1.totalPages; p++) {
        const res = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: p })
        if (res) allProducts = allProducts.concat(res.distribuitorProductCatalog.data)
      }

    // 2. Fetch stock map (variant SKU → total stock across all warehouses)
      const stockRes = await promoGQL<{ distributorStockCatalog: StockItem[] }>(STOCK_QUERY)
      const stockMap = new Map<string, number>()
      for (const s of stockRes?.distributorStockCatalog ?? []) {
      if (s.sku && s.currentStock != null) {
        stockMap.set(s.sku, (stockMap.get(s.sku) ?? 0) + s.currentStock)
      }
    }

    // 3. Build upsert rows
    const now = new Date().toISOString()
    const rows = allProducts.map((product) => {
      const pm = product.productModel
      const name = pm.nameProductModel
      const sku = pm.sku
      const mainImage = pm.media?.mainImages?.[0] ?? null
      
      const primaryCategory = pm.categories?.[0] || null
      const apiCategoryId = primaryCategory?.id || null
      const apiCategoryName = primaryCategory?.name || null
      const apiCategoryPath = pm.categories?.map(c => c.name).join(' > ') || null

      const categorySlug = mapToSlug(name, apiCategoryName || '')

      // Robust price parsing: sentinel detection + normalization
      const { price, raw: priceRaw, currency } = bestVariantPrice(product.variants)

      // Sum stock across all variant SKUs for this product model
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
        api_category_id: apiCategoryId,
        api_category_name: apiCategoryName,
        api_category_path: apiCategoryPath,
        raw_category: apiCategoryName || '',
        price,
        price_mx: price,
        currency_mx: currency,
        price_raw: priceRaw,
        price_source: 'api' as const,
        price_updated_at: now,
        stock: totalStock,
        stock_status: classifyStock(totalStock),
        stock_updated_at: now,
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

    // 4. Deduplicate slugs within this batch to avoid constraint conflicts
    const slugSeen = new Set<string>()
    for (const row of rows) {
      let slug = row.slug
      let counter = 2
      while (slugSeen.has(slug)) {
        slug = `${row.slug}-${counter++}`
      }
      slugSeen.add(slug)
      row.slug = slug
    }

    // 5. Upsert in chunks
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

    const inStock = rows.filter((r) => r.stock > 0).length
    const outOfStock = rows.filter((r) => r.stock === 0).length

    return NextResponse.json({
      ok: true,
      total: rows.length,
      upserted,
      pages: catalog1.totalPages,
      in_stock: inStock,
      out_of_stock: outOfStock,
    })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
