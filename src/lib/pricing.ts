/**
 * Pricing helpers — single source of truth for all price calculations.
 *
 * Two-step pricing:
 *  1. DISCOUNT_PERCENT (distributor level, e.g. 20) → applied first
 *  2. MARKUP_PERCENT (our margin, e.g. 36.6) → applied on top
 *
 * displayPrice = basePrice * (1 - DISCOUNT/100) * (1 + MARKUP/100)
 */

const DISCOUNT_PERCENT = (() => {
  const raw = process.env.DISCOUNT_PERCENT
  if (!raw) return 0
  const parsed = parseFloat(raw)
  return isNaN(parsed) ? 0 : parsed
})()

const MARKUP_PERCENT = (() => {
  const raw = process.env.MARKUP_PERCENT
  if (!raw) return 35
  const parsed = parseFloat(raw)
  return isNaN(parsed) ? 35 : parsed
})()

const MULTIPLIER = (1 - DISCOUNT_PERCENT / 100) * (1 + MARKUP_PERCENT / 100)

/**
 * Apply distributor discount + markup to a base price.
 * Returns null when price is null/undefined/zero.
 * Rounds to 2 decimal places.
 */
export function applyMarkup(price: number | null | undefined): number | null {
  if (price == null || price === 0) return null
  return Math.round(price * MULTIPLIER * 100) / 100
}

/**
 * The combined multiplier being applied.
 * Exposed so callers can log / audit.
 */
export const PRICE_MULTIPLIER = MULTIPLIER
