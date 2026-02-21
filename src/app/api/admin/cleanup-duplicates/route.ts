import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/admin/cleanup-duplicates
 *
 * Finds duplicate SKUs in the products table.
 * For each group of duplicates, keeps the row with the best score
 * (has price, has image_url, has category, longer name) and deletes the rest.
 *
 * Returns:
 *   { duplicates_removed, products_missing_price, top_dupes }
 */
export async function POST() {
  try {
    // 1. Fetch all products (id, sku, price, image_url, raw_category, name)
    const { data: allProducts, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('id, sku, price, image_url, raw_category, name')
      .order('sku')

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!allProducts?.length) {
      return NextResponse.json({
        ok: true,
        duplicates_removed: 0,
        products_missing_price: 0,
        top_dupes: [],
      })
    }

    // 2. Group by SKU
    type Row = { id: string; sku: string; price: number | null; image_url: string | null; raw_category: string | null; name: string }
    const groups = new Map<string, Row[]>()
    for (const p of allProducts as Row[]) {
      const sku = (p.sku ?? '').trim().toUpperCase()
      if (!groups.has(sku)) groups.set(sku, [])
      groups.get(sku)!.push(p)
    }

    // 3. For each group with duplicates, pick the best; collect IDs to delete
    function scoreRow(p: Row): number {
      let s = 0
      if (p.price !== null && p.price > 0) s += 50
      if (p.image_url) s += 20
      if (p.raw_category) s += 10
      s += Math.floor((p.name ?? '').length / 10)
      return s
    }

    const idsToDelete: string[] = []
    const topDupes: { sku: string; count: number }[] = []

    for (const [sku, rows] of groups.entries()) {
      if (rows.length <= 1) continue
      topDupes.push({ sku, count: rows.length })

      // Sort by score desc; keep first (best), delete the rest
      rows.sort((a, b) => scoreRow(b) - scoreRow(a))
      const toDelete = rows.slice(1).map((r) => r.id)
      idsToDelete.push(...toDelete)
    }

    // 4. Delete duplicates in batches of 500
    let duplicates_removed = 0
    const BATCH = 500
    for (let i = 0; i < idsToDelete.length; i += BATCH) {
      const batch = idsToDelete.slice(i, i + BATCH)
      const { error: delErr } = await supabaseAdmin
        .from('products')
        .delete()
        .in('id', batch)
      if (delErr) {
        console.error('[cleanup] delete error:', delErr.message)
        return NextResponse.json({ error: delErr.message }, { status: 500 })
      }
      duplicates_removed += batch.length
    }

    // 5. Count products missing price (after cleanup)
    const { count: missingPrice } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .is('price', null)

    // Top 10 dupes by count desc
    topDupes.sort((a, b) => b.count - a.count)

    console.log(`[cleanup] done. removed=${duplicates_removed} missing_price=${missingPrice}`)

    return NextResponse.json({
      ok: true,
      duplicates_removed,
      products_missing_price: missingPrice ?? 0,
      top_dupes: topDupes.slice(0, 10),
    })
  } catch (error: unknown) {
    const e = error as Error
    console.error('[cleanup] unhandled:', e.message)
    return NextResponse.json({ error: e.message ?? 'Error desconocido' }, { status: 500 })
  }
}
