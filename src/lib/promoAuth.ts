import { createClient } from '@supabase/supabase-js'

/**
 * Resolves the Promo GraphQL token.
 * Priority: PROMO_GRAPHQL_TOKEN env var → supabase settings table → empty string
 */
export async function resolvePromoToken(): Promise<string> {
  const envToken = process.env.PROMO_GRAPHQL_TOKEN
  if (envToken) return envToken

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'promo_graphql_token')
      .single()
    return (data?.value as string) || ''
  } catch {
    return ''
  }
}

/**
 * Returns fetch/axios headers for the Promo GraphQL endpoint.
 * Adds Authorization header only if token is non-empty.
 */
export function buildGraphQLHeaders(token: string): Record<string, string> {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0',
  }
  if (token) {
    base['Authorization'] = `Bearer ${token}`
  }
  return base
}

/**
 * Returns a human-readable error message based on HTTP status or error content.
 */
export function classifyGraphQLError(opts: {
  status?: number
  errorMessage?: string
  errorCode?: string
}): string {
  const { status, errorMessage, errorCode } = opts

  if (status === 401 || status === 403) {
    return 'Autenticación requerida (token). El servidor devolvió ' + status + '.'
  }
  if (errorMessage?.toLowerCase().includes('no authentication token')) {
    return 'Esta operación requiere token. Configúralo en Admin.'
  }
  if (errorMessage?.toLowerCase().includes('not authenticated') || errorMessage?.toLowerCase().includes('unauthorized')) {
    return 'Esta operación requiere token. Configúralo en Admin.'
  }
  if (errorCode === 'ENOTFOUND') {
    return 'No se pudo resolver el dominio (DNS). Verifica la URL del endpoint.'
  }
  if (errorCode === 'ECONNRESET') {
    return 'La conexión fue interrumpida (ECONNRESET). Reintenta.'
  }
  if (errorCode === 'ETIMEDOUT' || errorCode === 'FETCH_TIMEOUT') {
    return 'Tiempo de espera agotado (timeout). El servidor no respondió.'
  }
  if (!status && errorCode) {
    return `No se pudo conectar al endpoint GraphQL (network/TLS/DNS: ${errorCode}). Revisa logs.`
  }
  if (errorMessage) return errorMessage
  return 'Error desconocido'
}
