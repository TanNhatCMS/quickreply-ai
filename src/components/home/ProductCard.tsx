'use client'

import type { HomeProduct } from '@/lib/products'

interface ProductCardProps {
  product: HomeProduct
  onAddToCart: () => void
}

function formatVND(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ'
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 hover:shadow-lg transition-all duration-300 group flex flex-col h-full relative">
      <span className="absolute top-2 left-2 bg-promo-orange text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10">
        {product.discount}
      </span>

      <div className="h-40 w-full flex items-center justify-center mb-4 p-2 bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <p className="text-body-sm font-semibold text-on-surface line-clamp-2 mb-2">
        {product.name}
      </p>

      <div className="text-label-spec text-on-surface-variant space-y-1 mb-4 flex-grow bg-surface-container-low p-2 rounded font-[family-name:var(--font-label-spec)]">
        <p>{product.specs.cpu}</p>
        <p>{product.specs.gpu}</p>
        <p>
          {product.specs.ram} | {product.specs.storage}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-price-major)] text-[length:var(--text-price-major)] font-bold text-error">
          {formatVND(product.price)}
        </span>
        <span className="text-body-sm text-outline line-through">
          {formatVND(product.originalPrice)}
        </span>
      </div>

      <button
        onClick={onAddToCart}
        className="w-full mt-4 bg-surface-variant text-primary font-semibold py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors border border-transparent group-hover:border-primary"
      >
        Thêm vào giỏ
      </button>
    </div>
  )
}
