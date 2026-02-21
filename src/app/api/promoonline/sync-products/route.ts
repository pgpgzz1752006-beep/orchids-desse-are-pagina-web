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

      // ── Normalize + deduplicate ──────────────────────────────────
      const CHUNK_SIZE = 500
      const now = new Date().toISOString()
      let skipped_missing_sku = 0

      const dedupeMap = new Map<string, ProductRow>()
      for (const row of rows) {
        // Normalize SKU: trim, collapse spaces, uppercase
        const rawSku = String(row[skuCol] ?? '').trim().replace(/\s+/g, ' ').toUpperCase()
        const name   = String(row[nameCol] ?? '').trim()

        if (!rawSku) { skipped_missing_sku++; continue }
        if (!name)   { skipped_missing_sku++; continue }

        const rawCategory  = catCol   ? String(row[catCol]   ?? '').trim() : ''

        // Parse image_url: may be stored as JSON array string; take first URL
        let imageUrl: string | null = null
        if (imgCol) {
          const raw = String(row[imgCol] ?? '').trim()
          if (raw.startsWith('[')) {
            try {
              const arr = JSON.parse(raw) as unknown[]
              const first = arr[0]
              if (typeof first === 'string' && first.startsWith('http')) imageUrl = first
            } catch { /* ignore */ }
          } else if (raw.startsWith('http')) {
            imageUrl = raw
          }
        }

        const price        = priceCol ? parseFloat(String(row[priceCol]).replace(/[^0-9.]/g, '')) || null : null
        const stock        = stockCol ? parseInt(String(row[stockCol]).replace(/[^0-9]/g, ''), 10) || null : null
        const categorySlug = mapToSlug(name, rawCategory)

        // Last occurrence wins (consistent dedup)
        dedupeMap.set(rawSku, {
          sku: rawSku, name,
          image_url: imageUrl,
          raw_category: rawCategory,
          category_slug: categorySlug,
          price, stock,
          is_best_seller: false,
          is_recommended: false,
          updated_at: now,
        })
      }

      const total_rows_excel   = rows.length
      const duplicates_removed = total_rows_excel - skipped_missing_sku - dedupeMap.size
      const valid_rows         = dedupeMap.size
      const products           = Array.from(dedupeMap.values())

      if (!products.length) {
        return NextResponse.json({ error: 'No se parsearon productos válidos del Excel' }, { status: 422 })
      }

      // ── Upsert to Supabase in chunks ─────────────────────────────
      let inserted_or_updated = 0
      for (let i = 0; i < products.length; i += CHUNK_SIZE) {
        const chunk = products.slice(i, i + CHUNK_SIZE)
        const { data, error } = await supabaseAdmin
          .from('products')
          .upsert(chunk, { onConflict: 'sku', ignoreDuplicates: false })
          .select('id')

        if (error) {
          console.error(`[sync] upsert error chunk ${i}:`, error.message)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        inserted_or_updated += data?.length ?? 0
      }

      console.log(`[sync] Done. total_rows_excel=${total_rows_excel} valid_rows=${valid_rows} duplicates_removed=${duplicates_removed} skipped_missing_sku=${skipped_missing_sku} inserted_or_updated=${inserted_or_updated}`)

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
    console.error(`[sync] unhandled error name=${e.name} msg=${e.message} cause=${JSON.stringify(e.cause)}`)
    return NextResponse.json({ error: e.message ?? 'Error desconocido' }, { status: 500 })
  }
}
