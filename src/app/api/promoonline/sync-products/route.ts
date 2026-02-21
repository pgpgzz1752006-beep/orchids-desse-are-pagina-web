import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabaseAdmin } from '@/lib/supabase'
import { mapToSlug, detectColumn } from '@/lib/categoryMapper'
import { authedRequest } from '@/lib/promoonlineAuth'

const EXCEL_QUERY = `
  query GenerateProductsExcel {
    generateProductsExcel {
      file
      message
    }
  }
`

interface ExcelData {
  generateProductsExcel: { file: string; message: string }
}

interface ProductRow {
  sku: string
  name: string
  image_url: string | null
  raw_category: string
  category_slug: string
  price: number | null
  stock: number | null
  is_best_seller: boolean
  is_recommended: boolean
  updated_at: string
}

export async function POST(req: NextRequest) {
  try {
    let workbook: XLSX.WorkBook

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // ── Manual file upload ──────────────────────────────────
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    } else {
      // ── Auto sync from GraphQL ──────────────────────────────
      console.log('[sync] Requesting generateProductsExcel via authedRequest')
      const gqlRes = await authedRequest<ExcelData>(EXCEL_QUERY)

      if (gqlRes.errors?.length) {
        const msg = gqlRes.errors[0].message
        console.error('[sync] GraphQL error:', msg)
        const code =
          msg.toLowerCase().includes('no authentication token') ||
          msg.toLowerCase().includes('token expired') ||
          msg.toLowerCase().includes('unauthenticated')
            ? 'TOKEN_INVALID'
            : 'GRAPHQL_ERROR'
        const userMsg =
          code === 'TOKEN_INVALID'
            ? 'Token inválido o expirado.'
            : `Error GraphQL: ${msg}`
        return NextResponse.json({ error: code, message: userMsg }, { status: 400 })
      }

      const payload = gqlRes.data?.generateProductsExcel
      if (!payload?.file) {
        return NextResponse.json(
          { error: 'NO_FILE', message: 'La API respondió pero no devolvió un archivo.' },
          { status: 502 }
        )
      }

      const fileUrl = payload.file
      console.log(`[sync] Downloading Excel from: ${fileUrl.slice(0, 100)}`)
      const fileRes = await fetch(fileUrl)
      if (!fileRes.ok) {
        return NextResponse.json(
          { error: 'DOWNLOAD_FAILED', message: `No se pudo descargar el Excel (status ${fileRes.status})` },
          { status: 502 }
        )
      }
      const arrayBuffer = await fileRes.arrayBuffer()
      workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    }

    // ── Parse sheet ─────────────────────────────────────────────
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) {
      return NextResponse.json({ error: 'La hoja de Excel está vacía' }, { status: 422 })
    }

    const headers = Object.keys(rows[0])
    console.log(`[sync] Excel headers: ${headers.join(', ')}`)

    const skuCol   = detectColumn(headers, ['sku', 'clave', 'código', 'codigo', 'clave del producto'])
    const nameCol  = detectColumn(headers, ['nombre', 'descripcion', 'descripción', 'producto', 'name'])
    const catCol   = detectColumn(headers, ['categoría', 'categoria', 'línea', 'linea', 'grupo'])
    const imgCol   = detectColumn(headers, ['imagen', 'image', 'url', 'foto', 'picture'])
    const priceCol = detectColumn(headers, ['precio', 'price', 'costo', 'cost'])
    const stockCol = detectColumn(headers, ['existencia', 'stock', 'cantidad', 'inventory'])

    if (!skuCol || !nameCol) {
      return NextResponse.json(
        { error: 'No se detectaron columnas SKU o Nombre', headers },
        { status: 422 }
      )
    }

    // ── Normalize ────────────────────────────────────────────────
    const products: ProductRow[] = []
    for (const row of rows) {
      const sku  = String(row[skuCol]  ?? '').trim()
      const name = String(row[nameCol] ?? '').trim()
      if (!sku || !name) continue

      const rawCategory = catCol   ? String(row[catCol]   ?? '').trim() : ''
      const imageUrl    = imgCol   ? String(row[imgCol]   ?? '').trim() || null : null
      const price       = priceCol ? parseFloat(String(row[priceCol]).replace(/[^0-9.]/g, '')) || null : null
      const stock       = stockCol ? parseInt(String(row[stockCol]).replace(/[^0-9]/g, ''), 10) || null : null
      const categorySlug = mapToSlug(name, rawCategory)

      products.push({
        sku, name,
        image_url: imageUrl,
        raw_category: rawCategory,
        category_slug: categorySlug,
        price, stock,
        is_best_seller: false,
        is_recommended: false,
        updated_at: new Date().toISOString(),
      })
    }

    if (!products.length) {
      return NextResponse.json({ error: 'No se parsearon productos válidos del Excel' }, { status: 422 })
    }

      // ── Upsert to Supabase ───────────────────────────────────────
      const BATCH_SIZE = 500
      const allSkus = products.map((p) => p.sku)

      // Pre-fetch existing SKUs to diff new vs updated
      const { data: existingRows } = await supabaseAdmin
        .from('products')
        .select('sku')
        .in('sku', allSkus)
      const existingSkus = new Set((existingRows ?? []).map((r: { sku: string }) => r.sku))

      let upserted = 0
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE)
        const { data, error } = await supabaseAdmin
          .from('products')
          .upsert(batch, { onConflict: 'sku', ignoreDuplicates: false })
          .select('id')

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        upserted += data?.length ?? 0
      }

      const imported = products.filter((p) => !existingSkus.has(p.sku)).length
      const updated  = products.filter((p) =>  existingSkus.has(p.sku)).length
      const skipped  = products.length - upserted

      console.log(`[sync] Done. total=${products.length} imported=${imported} updated=${updated} skipped=${skipped}`)

      return NextResponse.json({
        ok: true,
        total: products.length,
        imported,
        updated,
        skipped,
      })
  } catch (error: unknown) {
    const e = error as NodeJS.ErrnoException & { cause?: unknown }
    console.error(`[sync] unhandled error name=${e.name} msg=${e.message} cause=${JSON.stringify(e.cause)}`)
    return NextResponse.json({ error: e.message ?? 'Error desconocido' }, { status: 500 })
  }
}
