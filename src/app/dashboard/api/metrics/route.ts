import { NextResponse } from 'next/server'
import { getDashboardMetrics } from '@/lib/dashboard'

export async function GET() {
  try {
    const metrics = await getDashboardMetrics()
    return NextResponse.json({
      totalConversations: metrics.totalConversations,
      avgResponseTimeMs: metrics.avgResponseTimeMs,
      aiDeflectionRate: metrics.aiDeflectionRate,
      conversionRate: metrics.conversionRate,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 },
    )
  }
}
