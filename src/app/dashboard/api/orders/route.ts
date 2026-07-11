import { NextResponse } from 'next/server'
import { getOrders } from '@/lib/dashboard'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10) || 20))
  const status = searchParams.get('status') ?? undefined

  try {
    const result = await getOrders(page, limit, status)

    return NextResponse.json({
      orders: result.data,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
    })
  } catch (error) {
    console.error('[dashboard/api/orders] fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    )
  }
}
