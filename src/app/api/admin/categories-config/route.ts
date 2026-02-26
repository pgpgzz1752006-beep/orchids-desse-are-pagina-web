import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const [categoriesRes, mappingsRes] = await Promise.all([
      supabaseAdmin.from('api_categories').select('*').order('name'),
      supabaseAdmin.from('category_mapping').select('*').order('label')
    ])

    return NextResponse.json({
      categories: categoriesRes.data || [],
      mappings: mappingsRes.data || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { site_slug, api_category_ids } = await req.json()
    const { error } = await supabaseAdmin
      .from('category_mapping')
      .update({ api_category_ids })
      .eq('site_slug', site_slug)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
