'use client'

import { useState } from 'react'
import { homeProducts } from '@/lib/products'
import { useCartStore } from '@/store/useCartStore'
import ProductCard from './ProductCard'

const brands = ['Asus', 'Acer', 'Lenovo'] as const

export default function ProductGrid() {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const filtered = selectedBrand
    ? homeProducts.filter((p) => p.brand === selectedBrand)
    : homeProducts

  return (
    <section
      id="products"
      className="space-y-[var(--spacing-stack-md)] bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <span className="material-symbols-outlined text-white">
            smart_toy
          </span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">
          Laptop AI - Hiệu Suất Đỉnh Cao
        </h2>
      </div>

      <div className="flex gap-2 flex-wrap">
        {brands.map((brand) => {
          const isActive = selectedBrand === brand
          return (
            <button
              key={brand}
              onClick={() =>
                setSelectedBrand(isActive ? null : brand)
              }
              className={`px-4 py-1.5 rounded-full border text-label-spec transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-outline-variant text-on-surface-variant'
              }`}
            >
              {brand}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={() =>
              addItem({
                productId: p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                image: p.image,
              })
            }
          />
        ))}
      </div>
    </section>
  )
}
