'use client'

interface MetricCardProps {
  icon: string
  label: string
  value: string | number
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export default function MetricCard({
  icon,
  label,
  value,
  trend,
  trendDirection,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
        <div className="flex items-center gap-sm mb-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse mb-xs" />
        <div className="h-4 w-16 bg-surface-container-high rounded animate-pulse" />
      </div>
    )
  }

  const trendColor =
    trendDirection === 'up'
      ? 'text-green-600 bg-green-50'
      : trendDirection === 'down'
        ? 'text-error bg-error-container'
        : 'text-on-surface-variant bg-surface-container-high'

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
      <div className="flex items-center gap-sm mb-sm">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[22px]">
            {icon}
          </span>
        </div>
        <span className="text-label-md text-on-surface-variant">{label}</span>
      </div>
      <p className="text-headline-md font-bold text-on-surface">{value}</p>
      {trend && (
        <span
          className={`inline-block mt-xs px-xs py-base text-label-sm font-medium rounded-md ${trendColor}`}
        >
          {trend}
        </span>
      )}
    </div>
  )
}
