import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabaseAdmin } from '@/lib/supabase'
import { mapToSlug, detectColumn } from '@/lib/categoryMapper'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://www.promocionalesonlinea.net/graphql'

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
      // ── Manual file upload path ──────────────────────────────
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })

    } else {
      // ── Auto sync from GraphQL API path ────────────────────
      const gqlRes = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: 'query GenerateProductsExcel { generateProductsExcel }' }),
      })

      if (!gqlRes.ok) {
        return NextResponse.json({ error: `GraphQL HTTP error: ${gqlRes.status}` }, { status: 502 })
      }

      const gqlData = await gqlRes.json()

      if (gqlData.errors?.length) {
        return NextResponse.json({ error: gqlData.errors[0].message }, { status: 502 })
      }

      const excelResult = gqlData?.data?.generateProductsExcel

      if (!excelResult) {
        return NextResponse.json({ error: 'generateProductsExcel returned null' }, { status: 502 })
      }

      if (typeof excelResult === 'string') {
        if (excelResult.startsWith('http')) {
          const fileRes = await fetch(excelResult)
          const arrayBuffer = await fileRes.arrayBuffer()
          workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        } else {
          // Assume base64
          const buffer = Buffer.from(excelResult, 'base64')
          workbook = XLSX.read(buffer, { type: 'buffer' })
        }
      } else if (typeof excelResult === 'object') {
        const url = excelResult.url || excelResult.downloadUrl || excelResult.fileUrl
        const b64 = excelResult.base64 || excelResult.file || excelResult.data
        if (url) {
          const fileRes = await fetch(url)
          const arrayBuffer = await fileRes.arrayBuffer()
          workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        } else if (b64) {
          const buffer = Buffer.from(b64, 'base64')
          workbook = XLSX.read(buffer, { type: 'buffer' })
        } else {
          return NextResponse.json({ error: 'Could not parse ExcelResponse format', raw: excelResult }, { status: 422 })
        }
      } else {
        return NextResponse.json({ error: 'Unexpected ExcelResponse type' }, { status: 422 })
      }
    }

    // ── Parse first sheet ────────────────────────────────────
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (!rows.length) {
      return NextResponse.json({ error: 'Excel sheet is empty' }, { status: 422 })
    }

    const headers = Object.keys(rows[0])

    const skuCol   = detectColumn(headers, ['sku', 'clave', 'código', 'codigo', 'clave del producto'])
    const nameCol  = detectColumn(headers, ['nombre', 'descripcion', 'descripción', 'producto', 'name'])
    const catCol   = detectColumn(headers, ['categoría', 'categoria', 'línea', 'linea', 'grupo'])
    const imgCol   = detectColumn(headers, ['imagen', 'image', 'url', 'foto', 'picture'])
    const priceCol = detectColumn(headers, ['precio', 'price', 'costo', 'cost'])
    const stockCol = detectColumn(headers, ['existencia', 'stock', 'cantidad', 'inventory'])

    if (!skuCol || !nameCol) {
      return NextResponse.json({ error: 'Could not detect SKU or Name columns', headers }, { status: 422 })
    }

    // ── Normalize rows ───────────────────────────────────────
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
      return NextResponse.json({ error: 'No valid products parsed from Excel' }, { status: 422 })
    }

    // ── Upsert to Supabase ───────────────────────────────────
    const BATCH_SIZE = 500
    let imported = 0

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)
      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(batch, { onConflict: 'sku', ignoreDuplicates: false })
        .select('id')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      imported += data?.length ?? 0
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      imported,
      skipped: products.length - imported,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
