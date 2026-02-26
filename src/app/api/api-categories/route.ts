import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { promoGQL, CATEGORIES_QUERY } from '@/lib/promoClient'

// Helper to slugify category names if needed
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    const res = await promoGQL<{ distribuitorCategoryCatalog: Array<{ id: string; name: string; parentId: string | null }> }>(CATEGORIES_QUERY)
    const categories = res.distribuitorCategoryCatalog ?? []

    if (categories.length === 0) {
      return NextResponse.json({ ok: true, count: 0, items: [] })
    }

    const rows = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: slugify(c.name),
      parent_id: c.parentId || null,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabaseAdmin
      .from('api_categories')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      console.error('[api-categories] Upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      count: rows.length,
      items: rows
    })
  } catch (error: any) {
    console.error('[api-categories] Sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
