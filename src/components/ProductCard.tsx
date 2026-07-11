'use client'

import { ShoppingCart, Star, Package } from 'lucide-react'

/** Product data shape for the storefront card */
export interface Product {
  id: string
  name: string
  brand: string
  price: number
  specifications: Record<string, string>
  stock: number
  image_url: string | null
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

/** Format VND currency */
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Extract key specs to display as tags */
function getKeySpecs(specs: Record<string, string>): string[] {
  const priority = ['cpu', 'ram', 'storage', 'gpu', 'screen']
  return priority
    .filter((key) => specs[key])
    .map((key) => specs[key])
    .slice(0, 3)
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const specs = product.specifications as Record<string, string>
  const keySpecs = getKeySpecs(specs)
  const isInStock = product.stock > 0

  return (
    <div className="product-card">
      {/* Product image */}
      <div className="product-card-image">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <Package size={32} className="text-gray-600" />
        )}
      </div>

      {/* Content */}
      <div className="product-card-content">
        {/* Brand badge */}
        <span className="product-brand-badge">{product.brand}</span>

        {/* Product name */}
        <h3 className="product-card-name">{product.name}</h3>

        {/* Key specs */}
        <div className="product-specs">
          {keySpecs.map((spec, i) => (
            <span key={i} className="product-spec-tag">
              {spec}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div className="product-card-footer">
          <div>
            <p className="product-price">{formatVND(product.price)}</p>
            {isInStock ? (
              <p className="product-stock in-stock">
                <Star size={10} className="inline mr-1" />
                Còn {product.stock} sản phẩm
              </p>
            ) : (
              <p className="product-stock out-of-stock">Hết hàng</p>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!isInStock}
            className="product-add-btn"
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart size={14} />
            <span>Thêm</span>
          </button>
        </div>
      </div>
    </div>
  )
}
