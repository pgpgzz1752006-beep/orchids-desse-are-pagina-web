import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, CatalogPage, PromoProduct, bestVariantPrice } from '@/lib/promoClient'
import { makeProductSlug, mapToSlug } from '@/lib/categoryMapper'
import { applyMarkup } from '@/lib/pricing'

const PRICE_STALE_MS = 24 * 60 * 60 * 1000  // 24 hours
const DETAIL_STALE_DAYS = 7

async function fetchAndCacheFromGraphQL(sku: string): Promise<Record<string, unknown> | null> {
  // Scan all pages to find the product by SKU
  try {
    const page1 = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: 1 })
    const totalPages = page1.distribuitorProductCatalog.totalPages

    const findInPage = (data: PromoProduct[]) =>
      data.find((p) => p.productModel.sku === sku || p.variants.some((v) => v.sku === sku))

    let found = findInPage(page1.distribuitorProductCatalog.data)

    if (!found) {
      for (let p = 2; p <= totalPages; p++) {
        const res = await promoGQL<CatalogPage>(CATALOG_QUERY, { page: p })
        found = findInPage(res.distribuitorProductCatalog.data)
        if (found) break
      }
    }

    if (!found) return null

    const pm = found.productModel
    const name = pm.nameProductModel
    const mainImage = pm.media?.mainImages?.[0] ?? null
    const now = new Date().toISOString()

    // Use robust price parsing with sentinel detection
    const { price, raw: priceRaw, currency } = bestVariantPrice(found.variants)

    const row = {
      sku: pm.sku,
      name,
      slug: makeProductSlug(name, pm.sku),
      image_url: mainImage,
      category_slug: mapToSlug(name, ''),
      raw_category: '',
      // Both legacy and new price columns
      price,
      price_mx: price,
      currency_mx: currency,
      price_raw: priceRaw,
      price_source: 'api',
      price_updated_at: now,
      description_mx: pm.descriptionMx ?? null,
      brand: pm.brand ?? null,
      capacity: pm.capacity ?? null,
      material: pm.features?.material ?? null,
      measure: pm.features?.measure ?? null,
      dimensions_json: pm.package?.dimensions ?? null,
      weights_json: pm.package?.weight ?? null,
      images_json: pm.media ?? null,
      variants_json: found.variants ?? null,
      details_synced_at: now,
      updated_at: now,
      is_best_seller: false,
      is_recommended: false,
    }

    await supabaseAdmin.from('products').upsert(row, { onConflict: 'sku', ignoreDuplicates: false })

    // Re-fetch to get the id + slug assigned by DB
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('sku', pm.sku)
      .single()

    return data as Record<string, unknown>
  } catch {
    return null
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // 1. Try DB by slug first
  const { data: dbRow } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (dbRow) {
    const priceUpdatedAt = dbRow.price_updated_at as string | null
    const syncedAt = dbRow.details_synced_at as string | null

    const priceStale = !priceUpdatedAt ||
      (Date.now() - new Date(priceUpdatedAt).getTime()) > PRICE_STALE_MS

    const detailStale = !syncedAt ||
      (Date.now() - new Date(syncedAt).getTime()) > DETAIL_STALE_DAYS * 86400_000

    if (priceStale || detailStale || !dbRow.description_mx) {
      // Refresh from GraphQL in background (don't block response)
      fetchAndCacheFromGraphQL(dbRow.sku as string).catch(() => {})
    }

    // Fetch related products with stock filter
    const related = await fetchRelated(
      dbRow.category_slug as string,
      dbRow.id as string
    )

    return NextResponse.json({ ...normalizeRow(dbRow), related })
  }

  // 2. Not in DB — fetch from GraphQL
  const skuGuess = slug.split('-').pop()?.toUpperCase() ?? ''
  let fresh = skuGuess ? await fetchAndCacheFromGraphQL(skuGuess) : null

  if (!fresh) {
    const { data: refetched } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
    fresh = refetched as Record<string, unknown> | null
  }

  if (!fresh) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const related = await fetchRelated(
    fresh.category_slug as string,
    fresh.id as string
  )

  return NextResponse.json({ ...normalizeRow(fresh), related })
}

/** Fetch related products — only those with stock > 0 */
async function fetchRelated(categorySlug: string, excludeId: string) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, slug, image_url, price, price_mx, category_slug')
    .eq('category_slug', categorySlug)
    .neq('id', excludeId)
    .gt('stock', 0)        // only products with confirmed stock
    .limit(8)

  return (data ?? []).map((r) => ({
    ...r,
    base_price: (r.price_mx ?? r.price) as number | null,
    price: applyMarkup((r.price_mx ?? r.price) as number | null),
  }))
}

function normalizeRow(row: Record<string, unknown>) {
  // base_price = raw value from DB (never modified)
  // price = base_price * markup (shown to users)
  const base = (row.price_mx ?? row.price) as number | null
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    image_url: row.image_url,
    category_slug: row.category_slug,
    base_price: base,
    price: applyMarkup(base),
    price_mx: applyMarkup(base),
    currency_mx: (row.currency_mx as string | null) ?? 'MXN',
    price_raw: row.price_raw ?? null,
    price_source: (row.price_source as string | null) ?? 'api',
    price_updated_at: row.price_updated_at ?? null,
    stock: row.stock ?? null,
    stock_status: row.stock_status ?? null,
    stock_updated_at: row.stock_updated_at ?? null,
    description_mx: row.description_mx ?? null,
    brand: row.brand ?? null,
    capacity: row.capacity ?? null,
    material: row.material ?? null,
    measure: row.measure ?? null,
    dimensions_json: row.dimensions_json ?? null,
    weights_json: row.weights_json ?? null,
    images_json: row.images_json ?? null,
    variants_json: row.variants_json ?? null,
  }
}
