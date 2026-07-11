'use client'

import { homeCategories } from '@/lib/products'

interface CategoryBarProps {
  selectedSlug: string | null
  onCategoryChange: (slug: string | null) => void
}

export default function CategoryBar({
  selectedSlug,
  onCategoryChange,
}: CategoryBarProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Danh mục nổi bật</h2>
        <a
          href="#"
          className="text-body-sm text-primary hover:underline"
        >
          Xem tất cả
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {homeCategories.map((cat) => {
          const isActive = selectedSlug === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() =>
                onCategoryChange(isActive ? null : cat.slug)
              }
              className="flex flex-col items-center min-w-[100px] cursor-pointer group"
            >
              <div
                className={`w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center border transition-colors ${
                  isActive
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-surface-container-lowest border-outline-variant/20 group-hover:border-primary/50'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant group-hover:text-primary'
                  }`}
                >
                  {cat.icon}
                </span>
              </div>
              <span
                className={`mt-3 text-body-sm transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant group-hover:text-primary'
                }`}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
