'use client'

interface FunnelStep {
  label: string
  count: number
  percentage: number
}

interface FunnelChartProps {
  steps: FunnelStep[]
  loading?: boolean
}

export default function FunnelChart({ steps, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
        <div className="h-5 w-32 bg-surface-container-high rounded animate-pulse mb-md" />
        {[100, 72, 28, 10].map((w, i) => (
          <div key={i} className="mb-sm">
            <div
              className="h-10 bg-surface-container-high rounded-lg animate-pulse"
              style={{ width: `${w}%` }}
            />
            {i < 3 && (
              <div className="flex justify-center py-base">
                <div className="w-px h-4 bg-surface-container-high" />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
      <h3 className="text-headline-sm font-bold text-on-surface mb-md">
        Conversion Funnel
      </h3>
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="flex items-center justify-between mb-xs">
            <span className="text-label-md text-on-surface-variant">
              {step.label}
            </span>
            <span className="text-label-md font-medium text-on-surface">
              {step.count.toLocaleString()} &middot; {step.percentage}%
            </span>
          </div>
          <div className="h-10 bg-surface-container rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg transition-all duration-500"
              style={{
                width: `${step.percentage}%`,
                backgroundColor: 'var(--color-primary)',
                opacity: 1 - i * 0.2,
              }}
            />
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-center py-base">
              <div className="w-px h-4 bg-outline-variant" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
