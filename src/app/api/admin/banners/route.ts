import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/admin/banners – list all banners ordered by sort_order
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banners: data ?? [] })
}

// POST /api/admin/banners – create new banner
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, image_url, alt_text, link_url, sort_order, is_active } = body

  if (!image_url) {
    return NextResponse.json({ error: 'image_url es requerida' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('banners')
    .insert({
      title: title ?? '',
      image_url,
      alt_text: alt_text ?? '',
      link_url: link_url ?? null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banner: data })
}

// PATCH /api/admin/banners – update one banner by id
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...fields } = body

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('banners')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banner: data })
}

// DELETE /api/admin/banners – delete one banner by id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await supabaseAdmin.from('banners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
