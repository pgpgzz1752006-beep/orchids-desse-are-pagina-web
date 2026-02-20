import { NextResponse } from 'next/server'
import axios from 'axios'
import { resolvePromoToken, buildGraphQLHeaders } from '@/lib/promoAuth'

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
      console.log(`[health] fetch ${url} status=${res.status} ct=${ct} preview=${rawText.slice(0, 200)}`)
      if (!ct.includes('json')) {
        return { ok: false, statusCode: res.status, rawText: rawText.slice(0, 300) }
      }
      const json = JSON.parse(rawText) as Record<string, unknown>
      return { ok: true, statusCode: res.status, json }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      console.error(`[health] fetch error url=${url} name=${e.name} msg=${e.message} code=${e.code} cause=${JSON.stringify(e.cause)}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  } else {
    try {
      const res = await axios.post(url, body, { timeout: 12_000, headers, maxRedirects: 5 })
      const ct: string = res.headers['content-type'] || ''
      console.log(`[health] axios ${url} status=${res.status} ct=${ct}`)
      if (typeof res.data === 'string') {
        return { ok: false, statusCode: res.status, rawText: (res.data as string).slice(0, 300) }
      }
      return { ok: true, statusCode: res.status, json: res.data as Record<string, unknown> }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      if (axios.isAxiosError(err) && err.response) {
        const rawText = typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data)
        console.error(`[health] axios http error url=${url} status=${err.response.status} body=${rawText.slice(0, 200)}`)
        return { ok: false, statusCode: err.response.status, rawText: rawText.slice(0, 300), errorMessage: e.message }
      }
      console.error(`[health] axios network error url=${url} name=${e.name} msg=${e.message} code=${e.code} cause=${JSON.stringify(e.cause)}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  }
}

// ── Probe __typename against one endpoint (fetch → axios fallback) ─
async function probeTypename(url: string, headers: Record<string, string>): Promise<{
  dns_ok: boolean
  graphql_ok: boolean
  typename?: string
  statusCode?: number
  errorCode?: string
  errorMessage?: string
  rawText?: string
}> {
  const body = { query: 'query { __typename }', variables: {} }
  const r1 = await tryPost(url, body, headers, false)

  if (!r1.ok) {
    await sleep(300)
    const r2 = await tryPost(url, body, headers, true)
    return parseResult(r2)
  }
  return parseResult(r1)
}

function parseResult(r: PostResult) {
  if (!r.ok || !r.json) {
    return {
      dns_ok: !!r.statusCode, // got HTTP = DNS ok
      graphql_ok: false,
      statusCode: r.statusCode,
      errorCode: r.errorCode,
      errorMessage: r.errorMessage,
      rawText: r.rawText,
    }
  }
  const data = r.json.data as Record<string, unknown> | undefined
  const errors = r.json.errors as { message: string }[] | undefined
  if (errors?.length) {
    return {
      dns_ok: true,
      graphql_ok: false,
      statusCode: r.statusCode,
      errorMessage: errors[0].message,
    }
  }
  const typename = data?.__typename as string | undefined
  if (typename) return { dns_ok: true, graphql_ok: true, typename, statusCode: r.statusCode }
  return { dns_ok: true, graphql_ok: false, statusCode: r.statusCode, rawText: JSON.stringify(r.json).slice(0, 200) }
}

export async function GET() {
  const token = await resolvePromoToken()

  // ── Gate: token required ──────────────────────────────────────────
  if (!token) {
    console.log('[health] No token configured — aborting')
    return NextResponse.json({
      endpoint_used: GRAPHQL_PRIMARY,
      token_ok: false,
      dns_ok: false,
      graphql_ok: false,
      excel_query_ok: false,
      status: null,
      details: { typename: null, excelResponseKeys: [] },
      error: 'TOKEN_MISSING',
      error_code: 'TOKEN_MISSING',
    })
  }

  const headers = buildGraphQLHeaders(token)

  // ── Step 1: probe primary endpoint ───────────────────────────────
  let endpointUsed = GRAPHQL_PRIMARY
  let probe = await probeTypename(GRAPHQL_PRIMARY, headers)

  // ── Step 2: fallback to no-www if DNS/network failed ─────────────
  if (!probe.dns_ok) {
    console.log('[health] Primary failed, trying fallback (no-www)...')
    await sleep(300)
    const probe2 = await probeTypename(GRAPHQL_FALLBACK, headers)
    if (probe2.dns_ok) {
      endpointUsed = GRAPHQL_FALLBACK
      probe = probe2
    }
  }

  // ── Step 3: if graphql_ok, test generateProductsExcel ────────────
  let excel_query_ok = false
  let excelResponseKeys: string[] = []
  let excelError: string | null = null

  if (probe.graphql_ok) {
    const r = await tryPost(
      endpointUsed,
      { query: 'query GenerateProductsExcel { generateProductsExcel }', variables: {} },
      headers,
      false
    )
    if (!r.ok || !r.json) {
      excelError = r.rawText
        ? `El servidor devolvió respuesta no-JSON (status ${r.statusCode}): ${r.rawText.slice(0, 200)}`
        : classifyError({ statusCode: r.statusCode, errorCode: r.errorCode, errorMessage: r.errorMessage })
    } else {
      const errors = r.json.errors as { message: string }[] | undefined
      if (errors?.length) {
        excelError = classifyError({ statusCode: r.statusCode, errorMessage: errors[0].message })
      } else {
        const result = (r.json.data as Record<string, unknown>)?.generateProductsExcel
        if (result !== null && result !== undefined) {
          excel_query_ok = true
          if (typeof result === 'object' && result !== null) {
            excelResponseKeys = Object.keys(result as object)
          } else if (typeof result === 'string') {
            excelResponseKeys = [(result as string).startsWith('http') ? 'url' : 'base64_string']
          }
        } else {
          excelError = 'generateProductsExcel devolvió null'
        }
      }
    }
  }

  const probeError = probe.errorMessage
    ? classifyError({ statusCode: probe.statusCode, errorMessage: probe.errorMessage, errorCode: probe.errorCode })
    : null

  const response = {
    endpoint_used: endpointUsed,
    token_ok: true,
    dns_ok: probe.dns_ok,
    graphql_ok: probe.graphql_ok,
    excel_query_ok,
    status: probe.statusCode ?? null,
    details: { typename: probe.typename ?? null, excelResponseKeys },
    error: excelError ?? probeError ?? null,
    error_code: probe.errorCode ?? null,
  }

  console.log('[health] result:', JSON.stringify(response))
  return NextResponse.json(response, { status: probe.dns_ok ? 200 : 503 })
}

function classifyError(opts: { statusCode?: number; errorMessage?: string; errorCode?: string }): string {
  const { statusCode, errorMessage, errorCode } = opts
  if (statusCode === 401 || statusCode === 403) return 'TOKEN_INVALID'
  const msg = errorMessage?.toLowerCase() ?? ''
  if (msg.includes('no authentication token') || msg.includes('not authenticated') || msg.includes('unauthorized')) {
    return 'TOKEN_INVALID'
  }
  if (errorCode === 'ENOTFOUND')  return 'NETWORK_ERROR'
  if (errorCode === 'ECONNRESET') return 'NETWORK_ERROR'
  if (errorCode === 'ETIMEDOUT')  return 'NETWORK_ERROR'
  if (!statusCode && errorCode)   return 'NETWORK_ERROR'
  if (errorMessage) return errorMessage
  return 'UNKNOWN_ERROR'
}
