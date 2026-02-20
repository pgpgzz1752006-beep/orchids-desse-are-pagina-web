import { NextResponse } from 'next/server'
import axios from 'axios'
import { resolvePromoToken, buildGraphQLHeaders, classifyGraphQLError } from '@/lib/promoAuth'

const GRAPHQL_PRIMARY  = 'https://www.promocionalesenlinea.net/graphql'
const GRAPHQL_FALLBACK = 'https://promocionalesenlinea.net/graphql'

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

interface AttemptResult {
  ok: boolean
  statusCode?: number
  contentType?: string
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
): Promise<AttemptResult> {
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
        return { ok: false, statusCode: res.status, contentType: ct, rawText }
      }
      const json = JSON.parse(rawText) as Record<string, unknown>
      return { ok: true, statusCode: res.status, contentType: ct, json }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      console.error(`[health] fetch error url=${url} name=${e.name} msg=${e.message} cause=${JSON.stringify(e.cause)} code=${e.code}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  } else {
    try {
      const res = await axios.post(url, body, { timeout: 12_000, headers, maxRedirects: 5 })
      const ct: string = res.headers['content-type'] || ''
      console.log(`[health] axios ${url} status=${res.status} ct=${ct}`)
      if (typeof res.data === 'string') {
        return { ok: false, statusCode: res.status, contentType: ct, rawText: (res.data as string).slice(0, 300) }
      }
      return { ok: true, statusCode: res.status, contentType: ct, json: res.data as Record<string, unknown> }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException & { cause?: unknown }
      if (axios.isAxiosError(err) && err.response) {
        const rawText = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)
        console.error(`[health] axios http error url=${url} status=${err.response.status} body=${rawText.slice(0, 200)}`)
        return { ok: false, statusCode: err.response.status, rawText: rawText.slice(0, 300), errorMessage: e.message }
      }
      console.error(`[health] axios network error url=${url} name=${e.name} msg=${e.message} code=${e.code} cause=${JSON.stringify(e.cause)}`)
      return { ok: false, errorCode: e.code || e.name, errorMessage: e.message }
    }
  }
}

async function probeEndpoint(url: string, headers: Record<string, string>): Promise<{
  dns_ok: boolean
  graphql_ok: boolean
  typename?: string
  statusCode?: number
  errorCode?: string
  errorMessage?: string
  rawText?: string
}> {
  const r1 = await tryPost(url, { query: 'query { __typename }', variables: {} }, headers, false)

  if (!r1.ok) {
    await sleep(300)
    const r2 = await tryPost(url, { query: 'query { __typename }', variables: {} }, headers, true)
    if (!r2.ok) {
      return {
        dns_ok: false,
        graphql_ok: false,
        statusCode: r2.statusCode,
        errorCode: r2.errorCode,
        errorMessage: r2.errorMessage || r1.errorMessage,
        rawText: r2.rawText,
      }
    }
    return parseTypenameResult(r2)
  }
  return parseTypenameResult(r1)
}

function parseTypenameResult(r: AttemptResult) {
  const json = r.json
  if (!json) return { dns_ok: true, graphql_ok: false, statusCode: r.statusCode, rawText: r.rawText }
  const data = json.data as Record<string, unknown> | undefined
  const typename = data?.__typename as string | undefined
  const errors = json.errors as { message: string }[] | undefined
  if (errors?.length) {
    return { dns_ok: true, graphql_ok: false, statusCode: r.statusCode, errorMessage: errors[0].message }
  }
  if (typename) {
    return { dns_ok: true, graphql_ok: true, typename, statusCode: r.statusCode }
  }
  return { dns_ok: true, graphql_ok: false, statusCode: r.statusCode, rawText: JSON.stringify(json).slice(0, 200) }
}

export async function GET() {
  const token = await resolvePromoToken()
  const headers = buildGraphQLHeaders(token)

  let endpointUsed = GRAPHQL_PRIMARY
  let probe = await probeEndpoint(GRAPHQL_PRIMARY, headers)

  if (!probe.dns_ok) {
    console.log('[health] Primary failed, trying fallback...')
    await sleep(300)
    const probe2 = await probeEndpoint(GRAPHQL_FALLBACK, headers)
    if (probe2.dns_ok) {
      endpointUsed = GRAPHQL_FALLBACK
      probe = probe2
    }
  }

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
    const json = r.json
    if (!r.ok || !json) {
      excelError = classifyGraphQLError({ status: r.statusCode, errorMessage: r.errorMessage, errorCode: r.errorCode })
    } else {
      const errors = json.errors as { message: string }[] | undefined
      if (errors?.length) {
        excelError = classifyGraphQLError({ status: r.statusCode, errorMessage: errors[0].message })
      } else {
        const result = (json.data as Record<string, unknown>)?.generateProductsExcel
        if (result !== null && result !== undefined) {
          excel_query_ok = true
          if (typeof result === 'object' && result !== null) {
            excelResponseKeys = Object.keys(result as object)
          } else if (typeof result === 'string') {
            excelResponseKeys = [(result as string).startsWith('http') ? 'url' : 'base64_string']
          }
        } else {
          excelError = 'generateProductsExcel devolvió null/undefined'
        }
      }
    }
  }

  const probeError = probe.errorMessage
    ? classifyGraphQLError({ status: probe.statusCode, errorMessage: probe.errorMessage, errorCode: probe.errorCode })
    : null

  const response = {
    endpoint_used: endpointUsed,
    dns_ok: probe.dns_ok,
    graphql_ok: probe.graphql_ok,
    excel_query_ok,
    token_configured: !!token,
    status: probe.statusCode ?? null,
    details: {
      typename: probe.typename ?? null,
      excelResponseKeys,
    },
    error: excelError ?? probeError ?? null,
    error_code: probe.errorCode ?? null,
  }

  console.log('[health] result:', JSON.stringify(response))

  return NextResponse.json(response, {
    status: probe.dns_ok ? 200 : 503,
  })
}
