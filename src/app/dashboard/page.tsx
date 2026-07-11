'use client'

import { useEffect, useState } from 'react'
import MetricCard from '@/components/dashboard/MetricCard'
import FunnelChart from '@/components/dashboard/FunnelChart'
import CategoryBarChart from '@/components/dashboard/CategoryBarChart'
import ErrorBanner from '@/components/dashboard/ErrorBanner'

interface Metrics {
  totalConversations: number
  avgResponseTimeMs: number
  aiDeflectionRate: number
  conversionRate: number
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/dashboard/api/metrics')
      if (!res.ok) throw new Error('Failed to load metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const responseTimeSec = metrics
    ? `${(metrics.avgResponseTimeMs / 1000).toFixed(1)}s`
    : '—'

  const funnelSteps = metrics
    ? [
        {
          label: 'Chat Started',
          count: metrics.totalConversations,
          percentage: 100,
        },
        {
          label: 'Product Click',
          count: Math.round(metrics.totalConversations * 0.71),
          percentage: 71,
        },
        {
          label: 'Add to Cart',
          count: Math.round(metrics.totalConversations * 0.19),
          percentage: 19,
        },
        {
          label: 'Purchase',
          count: Math.round(
            metrics.totalConversations * (metrics.conversionRate / 100),
          ),
          percentage: Math.round(metrics.conversionRate),
        },
      ]
    : []

  const categories = [
    { name: 'Laptop Gaming', percentage: 45 },
    { name: 'Components', percentage: 30 },
    { name: 'Office Laptops', percentage: 15 },
    { name: 'Accessories', percentage: 10 },
  ]

  return (
    <div className="space-y-md">
      <h2 className="text-headline-md font-bold text-on-surface">Overview</h2>

      {error && <ErrorBanner message={error} onRetry={fetchMetrics} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
        <MetricCard
          icon="forum"
          label="Total Conversations"
          value={metrics?.totalConversations.toLocaleString() ?? '—'}
          trend="+12% this week"
          trendDirection="up"
          loading={loading}
        />
        <MetricCard
          icon="show_chart"
          label="Conversion Rate"
          value={metrics ? `${metrics.conversionRate}%` : '—'}
          trend="+2.1% vs last week"
          trendDirection="up"
          loading={loading}
        />
        <MetricCard
          icon="smart_toy"
          label="AI Deflection Rate"
          value={metrics ? `${metrics.aiDeflectionRate}%` : '—'}
          trend="Stable"
          trendDirection="neutral"
          loading={loading}
        />
        <MetricCard
          icon="schedule"
          label="Avg Response Time"
          value={responseTimeSec}
          trend="-0.3s improvement"
          trendDirection="up"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-sm">
        <FunnelChart steps={funnelSteps} loading={loading} />
        <CategoryBarChart categories={categories} loading={loading} />
      </div>
    </div>
  )
}
