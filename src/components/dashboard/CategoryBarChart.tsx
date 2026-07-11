'use client'

interface Category {
  name: string
  percentage: number
}

interface CategoryBarChartProps {
  categories: Category[]
  loading?: boolean
}

export default function CategoryBarChart({
  categories,
  loading,
}: CategoryBarChartProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
        <div className="h-5 w-40 bg-surface-container-high rounded animate-pulse mb-md" />
        {[80, 60, 40, 25].map((w, i) => (
          <div key={i} className="mb-sm">
            <div className="flex justify-between mb-xs">
              <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse" />
              <div className="h-4 w-10 bg-surface-container-high rounded animate-pulse" />
            </div>
            <div
              className="h-3 bg-surface-container-high rounded-full animate-pulse"
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-md">
      <h3 className="text-headline-sm font-bold text-on-surface mb-md">
        Top Categories
      </h3>
      {categories.map((cat) => (
        <div key={cat.name} className="mb-sm">
          <div className="flex justify-between mb-xs">
            <span className="text-label-md text-on-surface-variant">
              {cat.name}
            </span>
            <span className="text-label-md font-medium text-on-surface">
              {cat.percentage}%
            </span>
          </div>
          <div className="h-3 bg-outline-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${cat.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
