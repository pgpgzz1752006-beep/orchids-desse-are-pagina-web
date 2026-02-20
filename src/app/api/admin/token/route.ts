import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/admin/token — returns masked token (last 4 chars) + whether one is set
export async function GET() {
  // Prefer env var override
  const envToken = process.env.PROMO_GRAPHQL_TOKEN
  if (envToken) {
    return NextResponse.json({
      source: 'env',
      set: true,
      masked: '••••••••' + envToken.slice(-4),
    })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'promo_graphql_token')
    .single()

  if (error || !data?.value) {
    return NextResponse.json({ source: 'db', set: false, masked: null })
  }

  const v: string = data.value
  return NextResponse.json({
    source: 'db',
    set: true,
    masked: '••••••••' + v.slice(-4),
  })
}

// POST /api/admin/token — saves token to Supabase settings
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const token: string | undefined = body?.token

  if (token === undefined) {
    return NextResponse.json({ error: 'Falta el campo token' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'promo_graphql_token', value: token, updated_at: new Date().toISOString() })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
