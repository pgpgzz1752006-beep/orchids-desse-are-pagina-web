/**
 * Pricing helpers — single source of truth for all price calculations.
 *
 * MARKUP is read from MARKUP_PERCENT env var (default 35).
 * The base price stored in the DB is never modified; markup is applied
 * only when building API responses.
 *
 * displayPrice = Math.round(basePrice * (1 + MARKUP_PERCENT/100) * 100) / 100
 */

const MARKUP_PERCENT = (() => {
  const raw = process.env.MARKUP_PERCENT
  if (!raw) return 35
  const parsed = parseFloat(raw)
  return isNaN(parsed) ? 35 : parsed
})()

const MULTIPLIER = 1 + MARKUP_PERCENT / 100 // e.g. 1.35

/**
 * Apply the global markup to a base price.
 * Returns null when price is null/undefined/zero.
 * Rounds to 2 decimal places.
 */
export function applyMarkup(price: number | null | undefined): number | null {
  if (price == null || price === 0) return null
  return Math.round(price * MULTIPLIER * 100) / 100
}

/**
 * The multiplier being applied (e.g. 1.35).
 * Exposed so callers can log / audit.
 */
export const PRICE_MULTIPLIER = MULTIPLIER
