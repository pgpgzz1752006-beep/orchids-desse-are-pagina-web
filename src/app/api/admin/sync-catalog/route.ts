import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  promoGQL,
  CATALOG_QUERY,
  CatalogPage,
  PromoProduct,
  bestVariantPrice,
} from '@/lib/promoClient'
import { makeProductSlug, mapToSlug } from '@/lib/categoryMapper'

function buildRow(item: PromoProduct, now: string) {
  const pm = item.productModel
  const name = pm.nameProductModel
  const mainImage = pm.media?.mainImages?.[0] ?? null

  const colors = Array.from(
    new Set(
      item.variants
        .map((v) => v.color?.trim().toUpperCase())
        .filter((c): c is string => !!c)
    )
  )

  // Collect all unique variantImages from every variant
  const allVariantImages = Array.from(
    new Set(
      item.variants.flatMap((v) => v.mediaAssets?.variantImages ?? [])
    )
  )

  const primaryCat = pm.categories?.[0]
  const api_category_id = primaryCat?.id ?? null
  const api_category_name = primaryCat?.name ?? null
  const api_category_path = pm.categories?.map((c) => c.name).join(' > ') ?? null

  let capacity_value: number | null = null
  let capacity_unit: string | null = null
  if (pm.capacity) {
    const match = pm.capacity.match(/([\d.,]+)\s*(.*)/)
    if (match) {
      capacity_value = parseFloat(match[1].replace(',', ''))
      capacity_unit = match[2].trim()
    }
  }

  const { price, raw: priceRaw, currency } = bestVariantPrice(item.variants)

  return {
    sku: pm.sku,
    name,
    slug: makeProductSlug(name, pm.sku),
    image_url: mainImage,
    category_slug: mapToSlug(name, ''),
    raw_category: '',
    price,
    price_mx: price,
    currency_mx: currency,
    price_raw: priceRaw,
    price_source: 'api',
    price_updated_at: now,
    description_mx: pm.descriptionMx ?? null,
    brand: pm.brand ?? null,
    product_type: api_category_name,
    capacity: pm.capacity ?? null,
    capacity_value,
    capacity_unit,
    colors,
    api_category_id,
    api_category_name,
    api_category_path,
    material: pm.features?.material ?? null,
    measure: pm.features?.measure ?? null,
    dimensions_json: pm.package?.dimensions ?? null,
    weights_json: pm.package?.weight ?? null,
      images_json: {
        mainImages: pm.media?.mainImages ?? [],
        vectorImages: pm.media?.vectorImages ?? [],
        variantImages: allVariantImages,
        // All displayable images: mainImages + variantImages deduplicated
        allImages: Array.from(new Set([
          ...(pm.media?.mainImages ?? []),
          ...allVariantImages,
        ])),
      },
    variants_json: item.variants ?? null,
    details_synced_at: now,
    updated_at: now,
  }
}

export async function POST(_req: NextRequest) {
  try {
    const now = new Date().toISOString()

      // Fetch page 1 to get total pages
      const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
      if (!page1) {
        return NextResponse.json({ ok: false, error: 'Promo API unavailable (rate-limited or auth error)' }, { status: 503 })
      }
      const { totalPages, data: page1Data } = page1.distribuitorProductCatalog

      let allProducts: PromoProduct[] = [...page1Data]

      // Fetch remaining pages in parallel batches of 5
      const BATCH = 5
      for (let start = 2; start <= totalPages; start += BATCH) {
        const end = Math.min(start + BATCH - 1, totalPages)
        const pages = await Promise.all(
          Array.from({ length: end - start + 1 }, (_, i) =>
            promoGQL<CatalogPage>(CATALOG_QUERY, { page: start + i })
          )
        )
        for (const p of pages) {
          if (p) allProducts = allProducts.concat(p.distribuitorProductCatalog.data)
        }
      }

    // Build rows
    const rows = allProducts.map((item) => buildRow(item, now))

    // Get existing SKUs so we can preserve created_at for existing products
      const { data: existingSkus } = await supabaseAdmin
        .from('products')
        .select('sku')
      const existingSkuSet = new Set((existingSkus ?? []).map((r: { sku: string }) => r.sku))

      // New products get created_at = now; existing products keep their created_at
      const rowsWithCreatedAt = rows.map((r) => ({
        ...r,
        ...(existingSkuSet.has(r.sku) ? {} : { created_at: now }),
      }))

      // Upsert in batches of 100 — preserve is_best_seller / is_recommended / created_at
      const UPSERT_BATCH = 100
      let upserted = 0
      let newProducts = 0
      let errors = 0

      for (let i = 0; i < rowsWithCreatedAt.length; i += UPSERT_BATCH) {
        const batch = rowsWithCreatedAt.slice(i, i + UPSERT_BATCH)
        const newInBatch = batch.filter((r) => !existingSkuSet.has(r.sku)).length
        const { error } = await supabaseAdmin
          .from('products')
          .upsert(batch, {
            onConflict: 'sku',
            ignoreDuplicates: false,
          })
        if (error) {
          errors++
          console.error('Upsert batch error:', error.message)
        } else {
          upserted += batch.length
          newProducts += newInBatch
        }
      }

    // Count new products (those whose updated_at equals now, meaning they were just inserted)
    const { count: totalInDb } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      ok: true,
        synced: upserted,
        newProducts,
        errors,
      totalFromApi: allProducts.length,
      totalInDb: totalInDb ?? 0,
      syncedAt: now,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  // Return current sync status from DB
  const { count } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { data: lastRow } = await supabaseAdmin
    .from('products')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    totalInDb: count ?? 0,
    lastSyncAt: lastRow?.updated_at ?? null,
  })
}
