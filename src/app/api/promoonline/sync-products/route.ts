import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabase'
import { mapToSlug, detectColumn } from '@/lib/categoryMapper'

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || 'https://www.promocionalesonlinea.net/graphql'

const GQL_QUERY = 'query GenerateProductsExcel { generateProductsExcel }'

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

// ── Retry helper ─────────────────────────────────────────────────
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Fetch GraphQL with fetch → axios fallback + retries ──────────
async function fetchGraphQL(): Promise<{
  data?: Record<string, unknown>
  errors?: { message: string }[]
  rawText?: string
  statusCode?: number
  networkError?: string
}> {
  const delays = [0, 500, 1500]

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await sleep(delays[attempt])

    // ── Try native fetch first ──────────────────────────────────
    if (attempt === 0 || attempt === 1) {
      try {
        console.log(`[sync] attempt=${attempt + 1} fetch → ${GRAPHQL_ENDPOINT}`)
        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({ query: GQL_QUERY, variables: {} }),
          redirect: 'follow',
          cache: 'no-store',
        })

        const ct = res.headers.get('content-type') || ''
        console.log(`[sync] status=${res.status} content-type=${ct}`)

        const rawText = await res.text()
        console.log(`[sync] body preview: ${rawText.slice(0, 500)}`)

        if (!ct.includes('json')) {
          return { rawText, statusCode: res.status }
        }

        const json = JSON.parse(rawText)
        return { data: json.data, errors: json.errors, statusCode: res.status }
      } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException & { cause?: unknown }
        console.error(
          `[sync] fetch error attempt=${attempt + 1} name=${e.name} msg=${e.message} cause=${JSON.stringify(e.cause)} stack=${e.stack}`
        )
        if (attempt < delays.length - 1) continue
      }
    }

    // ── Fallback: axios ─────────────────────────────────────────
    try {
      console.log(`[sync] attempt=${attempt + 1} axios → ${GRAPHQL_ENDPOINT}`)
      const res = await axios.post(
        GRAPHQL_ENDPOINT,
        { query: GQL_QUERY, variables: {} },
        {
          timeout: 20_000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          maxRedirects: 5,
        }
      )

      const ct: string = res.headers['content-type'] || ''
      console.log(`[sync] axios status=${res.status} content-type=${ct}`)

      if (typeof res.data === 'string') {
        console.log(`[sync] axios body preview: ${(res.data as string).slice(0, 500)}`)
        return { rawText: res.data as string, statusCode: res.status }
      }

      const json = res.data as { data?: Record<string, unknown>; errors?: { message: string }[] }
      return { data: json.data, errors: json.errors, statusCode: res.status }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          `[sync] axios error attempt=${attempt + 1} msg=${err.message} code=${err.code} status=${err.response?.status}`
        )
        if (err.response) {
          const rawText = typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
          console.log(`[sync] axios error body: ${rawText.slice(0, 500)}`)
          return {
            rawText,
            statusCode: err.response.status,
            networkError: err.message,
          }
        }
        return { networkError: err.message }
      }
      const e = err as Error
      console.error(`[sync] axios unknown error: ${e.message}`)
      return { networkError: e.message }
    }
  }

  return { networkError: 'All fetch/axios attempts exhausted' }
}

// ── Classify error for UI ─────────────────────────────────────────
function classifyError(result: Awaited<ReturnType<typeof fetchGraphQL>>): string {
  if (result.networkError && !result.statusCode) {
    return `No se pudo conectar al endpoint GraphQL (network/TLS/DNS). Revisa logs. Detalle: ${result.networkError}`
  }
  if (result.statusCode === 401 || result.statusCode === 403) {
    return 'Autenticación requerida (token). El servidor devolvió 401/403.'
  }
  if (result.errors?.length) {
    return result.errors[0].message
  }
  if (result.rawText) {
    return `El servidor no devolvió JSON. Status ${result.statusCode}. Respuesta: ${result.rawText.slice(0, 300)}`
  }
  return `Error desconocido (status ${result.statusCode})`
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
      console.log(`[sync] Starting GraphQL fetch → ${GRAPHQL_ENDPOINT}`)

      const gqlResult = await fetchGraphQL()

      if (!gqlResult.data && (gqlResult.networkError || gqlResult.rawText || gqlResult.errors)) {
        const msg = classifyError(gqlResult)
        return NextResponse.json({ error: msg, _debug: gqlResult }, { status: 502 })
      }

      const excelResult = gqlResult.data?.generateProductsExcel

      if (!excelResult) {
        return NextResponse.json(
          { error: 'generateProductsExcel returned null/undefined', _debug: gqlResult.data },
          { status: 502 }
        )
      }

      if (typeof excelResult === 'string') {
        if ((excelResult as string).startsWith('http')) {
          console.log(`[sync] Downloading Excel from URL: ${(excelResult as string).slice(0, 100)}`)
          const fileRes = await fetch(excelResult as string)
          const arrayBuffer = await fileRes.arrayBuffer()
          workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        } else {
          console.log(`[sync] Decoding base64 Excel, length=${(excelResult as string).length}`)
          const buffer = Buffer.from(excelResult as string, 'base64')
          workbook = XLSX.read(buffer, { type: 'buffer' })
        }
      } else if (typeof excelResult === 'object' && excelResult !== null) {
        const obj = excelResult as Record<string, string>
        const url = obj.url || obj.downloadUrl || obj.fileUrl
        const b64 = obj.base64 || obj.file || obj.data
        if (url) {
          console.log(`[sync] Downloading Excel from object URL: ${url.slice(0, 100)}`)
          const fileRes = await fetch(url)
          const arrayBuffer = await fileRes.arrayBuffer()
          workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
        } else if (b64) {
          console.log(`[sync] Decoding base64 from object, length=${b64.length}`)
          const buffer = Buffer.from(b64, 'base64')
          workbook = XLSX.read(buffer, { type: 'buffer' })
        } else {
          return NextResponse.json(
            { error: 'No se pudo detectar el formato de ExcelResponse', _debug: obj },
            { status: 422 }
          )
        }
      } else {
        return NextResponse.json({ error: 'Tipo inesperado en ExcelResponse' }, { status: 422 })
      }
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

    console.log(`[sync] Done. total=${products.length} imported=${imported}`)

    return NextResponse.json({
      success: true,
      total: products.length,
      imported,
      skipped: products.length - imported,
    })
  } catch (error: unknown) {
    const e = error as NodeJS.ErrnoException & { cause?: unknown }
    console.error(`[sync] unhandled error name=${e.name} msg=${e.message} cause=${JSON.stringify(e.cause)}`)
    return NextResponse.json({ error: e.message ?? 'Error desconocido' }, { status: 500 })
  }
}
