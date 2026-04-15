import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

interface CartItem {
  id: string
  name: string
  sku: string
  price: number | null
  quantity: number
  image?: string
}

interface CheckoutBody {
  items: CartItem[]
  tecnica?: { label: string; price: number } | null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody
    const { items, tecnica } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const MIN_ORDER = 30
    const itemsTotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)
    const tecnicaTotal = tecnica?.price || 0
    if (itemsTotal + tecnicaTotal < MIN_ORDER) {
      return NextResponse.json({ error: `El monto mínimo de compra es $${MIN_ORDER} MXN` }, { status: 400 })
    }

    // Build MP items
    const mpItems = items
      .filter((i) => i.price != null && i.price > 0)
      .map((i) => ({
        id: i.sku,
        title: i.name,
        quantity: i.quantity,
        unit_price: i.price as number,
        currency_id: 'MXN' as const,
        picture_url: i.image || undefined,
      }))

    // Add personalization technique as an item
    if (tecnica && tecnica.price > 0) {
      mpItems.push({
        id: 'PERSONALIZACION',
        title: `Personalización: ${tecnica.label}`,
        quantity: 1,
        unit_price: tecnica.price,
        currency_id: 'MXN' as const,
        picture_url: undefined,
      })
    }

    if (mpItems.length === 0) {
      return NextResponse.json({ error: 'No hay productos con precio válido' }, { status: 400 })
    }

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${getBaseUrl(req)}/checkout/gracias`,
          failure: `${getBaseUrl(req)}/carrito`,
          pending: `${getBaseUrl(req)}/checkout/pendiente`,
        },
        auto_return: 'approved',
        statement_descriptor: 'DISENARE PROMO',
      },
    })

    return NextResponse.json({
      init_point: result.init_point,
      preference_id: result.id,
    })
  } catch (err) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Error al crear preferencia'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  return `${proto}://${host}`
}
