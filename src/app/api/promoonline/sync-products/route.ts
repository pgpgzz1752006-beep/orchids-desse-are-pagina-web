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
  _score?: number
}

/** Parse price from strings like "$1,234.56", "1234", "1.234,56" */
function parsePrice(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const str = String(raw).trim()
  // Remove currency symbols, spaces
  const cleaned = str.replace(/[^0-9.,]/g, '')
  if (!cleaned) return null
  // If both comma and dot, assume last separator is decimal
  const dotIdx = cleaned.lastIndexOf('.')
  const commaIdx = cleaned.lastIndexOf(',')
  let normalized: string
  if (dotIdx > commaIdx) {
    // dot is decimal separator: remove commas
    normalized = cleaned.replace(/,/g, '')
  } else if (commaIdx > dotIdx) {
    // comma is decimal separator: remove dots, replace comma with dot
    normalized = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = cleaned
  }
  const n = parseFloat(normalized)
  return isNaN(n) || n <= 0 ? null : n
}

/** Extract first valid http URL from raw (may be JSON array string) */
function parseImageUrl(raw: unknown): string | null {
  if (!raw) return null
  const str = String(raw).trim()
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str) as unknown[]
      const first = arr[0]
      if (typeof first === 'string' && first.startsWith('http')) return first
    } catch { /* ignore */ }
  }
  if (str.startsWith('http')) return str
  return null
}

/** Score a product row: higher is "better" */
function score(p: ProductRow): number {
  let s = 0
  if (p.price !== null && p.price > 0) s += 50
  if (p.image_url) s += 20
  if (p.raw_category) s += 10
  s += Math.floor(p.name.length / 10)
  return s
}

const CHUNK_SIZE = 500

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

    // ── Normalize + score-based deduplication ────────────────────
    const now = new Date().toISOString()
    let skipped_missing_sku = 0
    const total_rows_excel = rows.length

    const dedupeMap = new Map<string, ProductRow>()

    for (const row of rows) {
      const rawSku = String(row[skuCol] ?? '').trim().replace(/\s+/g, ' ').toUpperCase()
      const name   = String(row[nameCol] ?? '').trim()

      if (!rawSku) { skipped_missing_sku++; continue }
      if (!name)   { skipped_missing_sku++; continue }

      const rawCategory  = catCol ? String(row[catCol] ?? '').trim() : ''
      const imageUrl     = imgCol ? parseImageUrl(row[imgCol]) : null
      const price        = priceCol ? parsePrice(row[priceCol]) : null
      const stock        = stockCol ? parseInt(String(row[stockCol]).replace(/[^0-9]/g, ''), 10) || null : null
      const categorySlug = mapToSlug(name, rawCategory)

      const candidate: ProductRow = {
        sku: rawSku, name,
        image_url: imageUrl,
        raw_category: rawCategory,
        category_slug: categorySlug,
        price, stock,
        is_best_seller: false,
        is_recommended: false,
        updated_at: now,
      }
      candidate._score = score(candidate)

      const existing = dedupeMap.get(rawSku)
      if (!existing || candidate._score > (existing._score ?? 0)) {
        dedupeMap.set(rawSku, candidate)
      }
    }

    const duplicates_removed = total_rows_excel - skipped_missing_sku - dedupeMap.size
    const valid_rows = dedupeMap.size

    // Strip internal _score before upsert
    const products: Omit<ProductRow, '_score'>[] = Array.from(dedupeMap.values()).map(
      ({ _score: _s, ...rest }) => rest
    )

    if (!products.length) {
      return NextResponse.json({ error: 'No se parsearon productos válidos del Excel' }, { status: 422 })
    }

    // ── Anti-null merge: fetch existing rows for this chunk's SKUs ─
    // So we never overwrite a good price/image_url with null
    let inserted_or_updated = 0

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE)
      const chunkSkus = chunk.map((p) => p.sku)

      // Fetch existing values for these SKUs
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('sku, price, image_url')
        .in('sku', chunkSkus)

      const existingMap = new Map<string, { price: number | null; image_url: string | null }>()
      if (existing) {
        for (const row of existing) {
          existingMap.set(row.sku as string, {
            price: row.price as number | null,
            image_url: row.image_url as string | null,
          })
        }
      }

      // Merge: never overwrite existing price/image_url with null
      const mergedChunk = chunk.map((p) => {
        const ex = existingMap.get(p.sku)
        if (!ex) return p
        return {
          ...p,
          price: p.price ?? ex.price,
          image_url: p.image_url ?? ex.image_url,
        }
      })

      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(mergedChunk, { onConflict: 'sku', ignoreDuplicates: false })
        .select('id')

      if (error) {
        console.error(`[sync] upsert error chunk ${i}:`, error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      inserted_or_updated += data?.length ?? 0
    }

    console.log(`[sync] Done. total=${total_rows_excel} valid=${valid_rows} dupes=${duplicates_removed} skipped=${skipped_missing_sku} upserted=${inserted_or_updated}`)

    return NextResponse.json({
      ok: true,
      total_rows_excel,
      valid_rows,
      duplicates_removed,
      skipped_missing_sku,
      inserted_or_updated,
    })
  } catch (error: unknown) {
    const e = error as NodeJS.ErrnoException & { cause?: unknown }
    console.error(`[sync] unhandled error name=${e.name} msg=${e.message}`)
    return NextResponse.json({ error: e.message ?? 'Error desconocido' }, { status: 500 })
  }
}
