import { NextRequest, NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://www.promocionalesenlinea.net/graphql'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ errors: [{ message }] }, { status: 500 })
  }
}
