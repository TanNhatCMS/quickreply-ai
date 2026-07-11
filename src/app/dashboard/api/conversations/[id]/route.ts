import { NextResponse } from 'next/server'
import { getConversationDetail } from '@/lib/dashboard'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const detail = await getConversationDetail(id)

    if (!detail) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      session: detail.session,
      messages: detail.messages,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
