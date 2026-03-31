import { NextRequest, NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET || ''

/**
 * Automated cron endpoint that triggers the catalog sync.
 * Protected by CRON_SECRET to prevent unauthorized access.
 *
 * Usage:
 *   GET /api/cron/sync?secret=YOUR_CRON_SECRET
 *   or with header: Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(req: NextRequest) {
  // Verify secret
  const urlSecret = req.nextUrl.searchParams.get('secret') || ''
  const headerSecret = req.headers.get('authorization')?.replace('Bearer ', '') || ''
  const providedSecret = urlSecret || headerSecret

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log(`[cron-sync] Starting automatic catalog sync at ${new Date().toISOString()}`)

  try {
    // Call the existing sync-catalog endpoint internally
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/sync-catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    if (!res.ok || !data.ok) {
      console.error(`[cron-sync] Sync failed after ${elapsed}s:`, data.error)
      return NextResponse.json({
        ok: false,
        error: data.error || 'Sync failed',
        elapsed: `${elapsed}s`,
      }, { status: 500 })
    }

    console.log(`[cron-sync] Sync completed in ${elapsed}s — synced: ${data.synced}, new: ${data.newProducts}, total in DB: ${data.totalInDb}`)

    return NextResponse.json({
      ok: true,
      synced: data.synced,
      newProducts: data.newProducts,
      totalInDb: data.totalInDb,
      elapsed: `${elapsed}s`,
      syncedAt: data.syncedAt,
    })
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[cron-sync] Error after ${elapsed}s:`, message)
    return NextResponse.json({
      ok: false,
      error: message,
      elapsed: `${elapsed}s`,
    }, { status: 500 })
  }
}
