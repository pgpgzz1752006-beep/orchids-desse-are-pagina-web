import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATALOG_QUERY, CatalogPage, PromoProduct } from '@/lib/promoClient'
import { makeProductSlug, mapToSlug } from '@/lib/categoryMapper'

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

    let price: number | null = null
    for (const v of found.variants ?? []) {
      const prices = v.pricing?.priceMx
      if (prices?.length) {
        const n = parseFloat(prices[0].amount)
        if (!isNaN(n) && n > 0) { price = n; break }
      }
    }

    const row = {
      sku: pm.sku,
      name,
      slug: makeProductSlug(name, pm.sku),
      image_url: mainImage,
      category_slug: mapToSlug(name, ''),
      raw_category: '',
      price,
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
    // Check if detail fields are fresh enough
    const syncedAt = dbRow.details_synced_at as string | null
    const stale = !syncedAt ||
      (Date.now() - new Date(syncedAt).getTime()) > DETAIL_STALE_DAYS * 86400_000

    if (stale || !dbRow.description_mx) {
      // Refresh from GraphQL in background (don't block response)
      fetchAndCacheFromGraphQL(dbRow.sku as string).catch(() => {})
    }

    return NextResponse.json(normalizeRow(dbRow))
  }

  // 2. Not in DB — fetch from GraphQL
  // The slug might encode the sku: try to extract it
  const skuGuess = slug.split('-').pop()?.toUpperCase() ?? ''
  let fresh = skuGuess ? await fetchAndCacheFromGraphQL(skuGuess) : null

  if (!fresh) {
    // Last resort: scan by slug match after syncing
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

  return NextResponse.json(normalizeRow(fresh))
}

function normalizeRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    image_url: row.image_url,
    category_slug: row.category_slug,
    price: row.price,
    stock: row.stock,
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
