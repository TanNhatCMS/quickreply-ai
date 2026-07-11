import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface OrderItemInput {
  productId: string
  name: string
  brand?: string
  price: number
  quantity: number
  image?: string
}

export async function POST(req: Request) {
  let body: { sessionId?: string; items: OrderItemInput[] }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { sessionId, items } = body

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'items array is required and must be non-empty' },
      { status: 400 },
    )
  }

  for (const item of items) {
    if (typeof item.productId !== 'string' || !item.productId) {
      return NextResponse.json(
        { error: 'Each item must have a valid productId (string)' },
        { status: 400 },
      )
    }
    if (typeof item.name !== 'string' || !item.name) {
      return NextResponse.json(
        { error: 'Each item must have a valid name (string)' },
        { status: 400 },
      )
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return NextResponse.json(
        { error: 'Each item must have a valid price (number >= 0)' },
        { status: 400 },
      )
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json(
        { error: 'Each item must have a valid quantity (integer >= 1)' },
        { status: 400 },
      )
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const { data, error } = await supabase
    .from('orders')
    .insert({
      session_id: sessionId ?? null,
      items,
      total,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[api/orders] insert failed:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { orderId: data.id, status: 'pending', total },
    { status: 201 },
  )
}
