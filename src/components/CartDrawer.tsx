'use client'

import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import { useCartStore, selectCartCount, selectCartTotal } from '@/store/useCartStore'

/** Format VND currency */
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  const totalCount = useCartStore(selectCartCount)
  const totalPrice = useCartStore(selectCartTotal)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="cart-backdrop"
        onClick={() => toggleDrawer(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="cart-drawer"
        role="complementary"
        aria-label="Giỏ hàng"
        id="cart-drawer"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-indigo-400" />
            <h2 className="font-bold text-base">Giỏ hàng</h2>
            {totalCount > 0 && (
              <span className="cart-count-badge">{totalCount}</span>
            )}
          </div>
          <button
            onClick={() => toggleDrawer(false)}
            className="cart-close-btn"
            aria-label="Đóng giỏ hàng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item list */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={40} className="text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Giỏ hàng trống</p>
              <p className="text-gray-500 text-xs mt-1">
                Hỏi AI để tìm sản phẩm phù hợp!
              </p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.productId} className="cart-item">
                  {/* Image */}
                  <div className="cart-item-image">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <ShoppingCart size={20} className="text-gray-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="cart-item-details">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-brand">{item.brand}</p>
                    <p className="cart-item-price">{formatVND(item.price)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="cart-qty-btn"
                      aria-label="Giảm số lượng"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="cart-qty-btn"
                      aria-label="Tăng số lượng"
                    >
                      <Plus size={12} />
                    </button>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="cart-remove-btn"
                      aria-label={`Xóa ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear button */}
              <button onClick={clearCart} className="cart-clear-btn">
                Xóa tất cả
              </button>
            </>
          )}
        </div>

        {/* Footer / checkout */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="text-gray-400 text-sm">Tổng cộng</span>
              <span className="cart-total-price">{formatVND(totalPrice)}</span>
            </div>
            <button className="cart-checkout-btn" id="checkout-btn">
              <CreditCard size={16} />
              Thanh toán ({totalCount} sản phẩm)
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              * Demo MVP — thanh toán thực chưa được tích hợp
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
