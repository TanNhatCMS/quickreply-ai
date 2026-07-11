import { NextResponse } from 'next/server'
import { getConversations } from '@/lib/dashboard'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const search = searchParams.get('search') || undefined

    const result = await getConversations(page, limit, search)

    return NextResponse.json({
      sessions: result.data,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
