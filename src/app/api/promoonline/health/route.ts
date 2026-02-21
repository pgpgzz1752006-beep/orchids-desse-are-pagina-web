import { NextResponse } from 'next/server'
import axios from 'axios'
import { getAccessToken } from '@/lib/promoonlineAuth'

const GRAPHQL_PRIMARY  = 'https://www.promocionalesenlinea.net/graphql'
const GRAPHQL_FALLBACK = 'https://promocionalesenlinea.net/graphql'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

interface PostResult {
  ok: boolean
  statusCode?: number
  json?: Record<string, unknown>
  rawText?: string
  errorCode?: string
  errorMessage?: string
}

async function tryPost(
  url: string,
  body: object,
  headers: Record<string, string>,
  useAxios: boolean
): Promise<PostResult> {
  const payload = JSON.stringify(body)
  const tag = `[health] ${useAxios ? 'axios' : 'fetch'} ${url}`

  if (!useAxios) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: payload,
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(12_000),
      })
      const ct = res.headers.get('content-type') || ''
      const rawText = await res.text()
      console.log(`${tag} status=${res.status} ct=${ct} preview=${rawText.slice(0, 200)}`)
      if (!ct.includes('json')) {
        return { ok: false, statusCode: res.status, rawText: rawText.slice(0, 300) }
      }
      const json = JSON.parse(rawText) as Record<string, unknown>
      return { ok: true, statusCode: res.status, json }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      console.error(`${tag} ERROR name=${e.name} msg=${e.message} code=${e.code} cause=${JSON.stringify(e.cause)}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  } else {
    try {
      const res = await axios.post(url, body, { timeout: 12_000, headers, maxRedirects: 5 })
      const ct: string = res.headers['content-type'] || ''
      console.log(`${tag} status=${res.status} ct=${ct}`)
      if (typeof res.data === 'string') {
        return { ok: false, statusCode: res.status, rawText: (res.data as string).slice(0, 300) }
      }
      return { ok: true, statusCode: res.status, json: res.data as Record<string, unknown> }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      if (axios.isAxiosError(err) && err.response) {
        const rawText =
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        console.error(`${tag} HTTP error status=${err.response.status} body=${rawText.slice(0, 200)}`)
        return { ok: false, statusCode: err.response.status, rawText: rawText.slice(0, 300), errorMessage: e.message }
      }
      console.error(`${tag} NETWORK error name=${e.name} msg=${e.message} code=${e.code} cause=${JSON.stringify(e.cause)}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  }
}

/** Try one endpoint with fetch → axios fallback */
async function probeExcel(
  url: string,
  headers: Record<string, string>
): Promise<{
  dns_ok: boolean
  excel_query_ok: boolean
  statusCode?: number
  errorCode?: string
  errorMessage?: string
  rawText?: string
  excelResponseKeys: string[]
}> {
  const body = { query: 'query GenerateProductsExcel { generateProductsExcel }', variables: {} }

  let r = await tryPost(url, body, headers, false)

  // If no HTTP response at all → retry with axios
  if (!r.ok && !r.statusCode) {
    await sleep(300)
    r = await tryPost(url, body, headers, true)
  }

  // No HTTP response = DNS/network failure
  if (!r.statusCode && !r.ok) {
    return {
      dns_ok: false,
      excel_query_ok: false,
      errorCode: r.errorCode,
      errorMessage: r.errorMessage,
      excelResponseKeys: [],
    }
  }

  // Got a response → DNS is working
  if (!r.ok || !r.json) {
    return {
      dns_ok: true,
      excel_query_ok: false,
      statusCode: r.statusCode,
      rawText: r.rawText,
      errorMessage: r.errorMessage,
      excelResponseKeys: [],
    }
  }

  const errors = r.json.errors as { message: string }[] | undefined
  if (errors?.length) {
    return {
      dns_ok: true,
      excel_query_ok: false,
      statusCode: r.statusCode,
      errorMessage: errors[0].message,
      excelResponseKeys: [],
    }
  }

  const result = (r.json.data as Record<string, unknown>)?.generateProductsExcel
  if (result === null || result === undefined) {
    return {
      dns_ok: true,
      excel_query_ok: false,
      statusCode: r.statusCode,
      errorMessage: 'generateProductsExcel devolvió null',
      excelResponseKeys: [],
    }
  }

  let keys: string[] = []
  if (typeof result === 'object' && result !== null) {
    keys = Object.keys(result as object)
  } else if (typeof result === 'string') {
    keys = [(result as string).startsWith('http') ? 'url' : 'base64_string']
  }

  return {
    dns_ok: true,
    excel_query_ok: true,
    statusCode: r.statusCode,
    excelResponseKeys: keys,
  }
}

function classifyError(opts: {
  statusCode?: number
  errorMessage?: string
  errorCode?: string
}): string {
  const { statusCode, errorMessage, errorCode } = opts
  if (statusCode === 401 || statusCode === 403) return 'TOKEN_INVALID'
  const msg = (errorMessage ?? '').toLowerCase()
  if (msg.includes('no authentication token') || msg.includes('not authenticated') || msg.includes('unauthorized')) {
    return 'TOKEN_INVALID'
  }
  if (errorCode === 'ENOTFOUND')  return 'NETWORK_ERROR'
  if (errorCode === 'ECONNRESET') return 'NETWORK_ERROR'
  if (errorCode === 'ETIMEDOUT')  return 'NETWORK_ERROR'
  if (!statusCode && errorCode)   return 'NETWORK_ERROR'
  if (errorMessage)               return errorMessage
  return 'UNKNOWN_ERROR'
}

export async function GET() {
  const token = await resolvePromoToken()

  // ── Gate: no token → stop here ────────────────────────────────────
  if (!token) {
    console.log('[health] No token configured — aborting')
    return NextResponse.json({
      endpoint_used: GRAPHQL_PRIMARY,
      token_ok: false,
      dns_ok: false,
      excel_query_ok: false,
      status: null,
      details: { excelResponseKeys: [] },
      error: 'TOKEN_MISSING',
      error_code: 'TOKEN_MISSING',
    })
  }

  const headers = buildGraphQLHeaders(token)
  console.log('[health] Token present — probing generateProductsExcel')

  // ── Step 1: probe primary endpoint ────────────────────────────────
  let endpointUsed = GRAPHQL_PRIMARY
  let probe = await probeExcel(GRAPHQL_PRIMARY, headers)

  // ── Step 2: fallback (no-www) if DNS failed ───────────────────────
  if (!probe.dns_ok) {
    console.log('[health] Primary DNS failed → trying fallback (no-www)')
    await sleep(300)
    const probe2 = await probeExcel(GRAPHQL_FALLBACK, headers)
    if (probe2.dns_ok) {
      endpointUsed = GRAPHQL_FALLBACK
      probe = probe2
    }
  }

  const errorMsg = probe.errorMessage
    ? classifyError({ statusCode: probe.statusCode, errorMessage: probe.errorMessage, errorCode: probe.errorCode })
    : probe.rawText
    ? `El servidor devolvió respuesta no-JSON (status ${probe.statusCode}): ${probe.rawText.slice(0, 200)}`
    : null

  const response = {
    endpoint_used: endpointUsed,
    token_ok: true,
    dns_ok: probe.dns_ok,
    excel_query_ok: probe.excel_query_ok,
    status: probe.statusCode ?? null,
    details: { excelResponseKeys: probe.excelResponseKeys },
    error: errorMsg,
    error_code: probe.errorCode ?? null,
  }

  console.log('[health] result:', JSON.stringify(response))
  return NextResponse.json(response, { status: probe.dns_ok ? 200 : 503 })
}
