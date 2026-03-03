/**
 * Server-only GraphQL client for Promocionales en Línea API.
 * Handles login, token caching (23h), and auto-renew on expiry.
 */

const ENDPOINT = process.env.PROMO_GRAPHQL_ENDPOINT!
const EMAIL = process.env.PROMO_EMAIL!
const PASSWORD = process.env.PROMO_PASSWORD!

// In-process token cache (survives the lifetime of the Node process)
let cachedToken: string | null = null
let tokenFetchedAt: number = 0
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000 // 23 hours

async function fetchNewToken(): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { login(email: "${EMAIL}", password: "${PASSWORD}") { accessToken } }`,
    }),
    cache: 'no-store',
  })
  const json = await res.json()
  const token = json?.data?.login?.accessToken
  if (!token) throw new Error('Promo login failed: ' + JSON.stringify(json))
  return token
}

export async function getPromoToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && now - tokenFetchedAt < TOKEN_TTL_MS) {
    return cachedToken
  }
  cachedToken = await fetchNewToken()
  tokenFetchedAt = now
  return cachedToken
}

export async function promoGQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  retried = false
): Promise<T> {
  const token = await getPromoToken()
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  })
  const json = await res.json()

  // Auto-renew on auth errors
  const firstError = json?.errors?.[0]
  if (!retried && firstError) {
    const msg = firstError.message?.toLowerCase() ?? ''
    if (
      res.status === 401 ||
      res.status === 403 ||
      msg.includes('not authenticated') ||
      msg.includes('unauthorized') ||
      msg.includes('token')
    ) {
      cachedToken = null
      return promoGQL<T>(query, variables, true)
    }
  }

  if (json?.errors) {
    throw new Error('GraphQL error: ' + JSON.stringify(json.errors))
  }
  return json.data as T
}

// ─── Price parsing ──────────────────────────────────────────────────────────

/** Sentinel values the API uses to mean "no price" */
const PRICE_SENTINELS = new Set([99999999, 99999998, 99999997, 0])
const PRICE_SENTINEL_THRESHOLD = 90000000 // anything >= this is treated as no-price

/**
 * Parse a raw price amount string from the API into a clean numeric value.
 * Returns { price, raw, currency } where price is null when the value is
 * unavailable / a sentinel.
 *
 * Rules:
 *  1. Strip commas, currency symbols, and spaces.
 *  2. Parse as float.
 *  3. If value >= PRICE_SENTINEL_THRESHOLD → null (sentinel).
 *  4. If value <= 0 → null.
 *  5. Otherwise return the value as-is (API already sends MXN amounts,
 *     NOT in centavos — confirmed by inspection: e.g. "412.89").
 */
export function parseApiPrice(
  priceMxArray: Array<{ amount: string; currency: string }> | null | undefined
): { price: number | null; raw: string | null; currency: string } {
  if (!priceMxArray || priceMxArray.length === 0) {
    return { price: null, raw: null, currency: 'MXN' }
  }

  const entry = priceMxArray[0]
  const raw = String(entry.amount ?? '').trim()
  const currency = entry.currency || 'MXN'

  // Clean: remove commas, currency symbols, spaces
  const cleaned = raw.replace(/[,\s$€£¥]/g, '')
  const num = parseFloat(cleaned)

  if (isNaN(num) || num <= 0) {
    return { price: null, raw, currency }
  }

  if (num >= PRICE_SENTINEL_THRESHOLD || PRICE_SENTINELS.has(Math.round(num))) {
    return { price: null, raw, currency }
  }

  return { price: num, raw, currency }
}

/**
 * Extract the best price from a product's variants array.
 * Picks the first variant that has a valid priceMx value.
 * If no variant has a valid price, returns { price: null, raw: null, currency: 'MXN' }.
 */
export function bestVariantPrice(
  variants: PromoVariant[] | null | undefined
): { price: number | null; raw: string | null; currency: string } {
  for (const v of variants ?? []) {
    const result = parseApiPrice(v.pricing?.priceMx)
    if (result.price !== null) return result
  }
  return { price: null, raw: null, currency: 'MXN' }
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const CATALOG_QUERY = `
  query Catalog($page: Int!) {
    distribuitorProductCatalog(page: $page) {
      currentPage
      totalPages
      perPage
      hasNextPage
      data {
        productModel {
          sku
          nameProductModel
          descriptionMx
          brand
          capacity
          media {
            mainImages
            vectorImages
          }
          package {
            dimensions {
              heightInCentimeters
              lengthInCentimeters
              widthInCentimeters
              individualBoxDimensions
            }
            weight {
              grossWeight
              netWeight
              unitWeight
            }
            units {
              piecesPerBox
              saleMultiples
            }
          }
          features {
            material
            measure
            sizeMeasures
            isEcological
            isWaterproof
            hasBluetooth
          }

        }
        variants {
          sku
          name
          color
          size
          pricing {
            priceMx {
              amount
              currency
            }
          }
          availability {
            isEnabledVariantMx
          }
        }
      }
    }
  }
`

export const STOCK_QUERY = `
  {
    distributorStockCatalog {
      sku
      currentStock
      locationName
    }
  }
`

export const CATEGORIES_QUERY = `
  {
    distribuitorCategoryCatalog {
      id
      name
      parentId
    }
  }
`

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PromoVariant {
  sku: string
  name: string
  color: string | null
  size: string | null
  pricing: { priceMx: Array<{ amount: string; currency: string }> } | null
  availability: { isEnabledVariantMx: boolean } | null
}

export interface PromoProductModel {
  sku: string
  nameProductModel: string
  descriptionMx: string | null
  brand: string | null
  capacity: string | null
  media: { mainImages: string[]; vectorImages: string[] } | null
  package: {
    dimensions: {
      heightInCentimeters: number | null
      lengthInCentimeters: number | null
      widthInCentimeters: number | null
      individualBoxDimensions: string | null
    } | null
    weight: {
      grossWeight: number | null
      netWeight: number | null
      unitWeight: string | null
    } | null
    units: {
      piecesPerBox: number | null
      saleMultiples: number | null
    } | null
  } | null
  features: {
    material: string | null
    measure: string | null
    sizeMeasures: string | null
    isEcological: boolean | null
    isWaterproof: boolean | null
    hasBluetooth: boolean | null
  } | null
  categories: Array<{ id: string; name: string; parentId: string | null }> | null
}

export interface PromoProduct {
  productModel: PromoProductModel
  variants: PromoVariant[]
}

export interface CatalogPage {
  distribuitorProductCatalog: {
    currentPage: number
    totalPages: number
    perPage: number
    hasNextPage: boolean
    data: PromoProduct[]
  }
}

export interface StockItem {
  sku: string
  currentStock: number | null
  locationName: string | null
}
