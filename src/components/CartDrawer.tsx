'use client'

import { useState } from 'react'
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { useCartStore, selectCartCount, selectCartTotal } from '@/store/useCartStore'
import { getSessionId } from '@/lib/session'

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

  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Đặt hàng thất bại')
      }

      clearCart()
      setCheckoutSuccess(true)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Đặt hàng thất bại')
    } finally {
      setCheckoutLoading(false)
    }
  }

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
        {items.length > 0 && !checkoutSuccess && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="text-gray-400 text-sm">Tổng cộng</span>
              <span className="cart-total-price">{formatVND(totalPrice)}</span>
            </div>
            {checkoutError && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={14} />
                {checkoutError}
              </div>
            )}
            <button
              className="cart-checkout-btn"
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              <CreditCard size={16} />
              {checkoutLoading ? 'Đang xử lý...' : `Thanh toán (${totalCount} sản phẩm)`}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              * Demo MVP — thanh toán thực chưa được tích hợp
            </p>
          </div>
        )}

        {checkoutSuccess && (
          <div className="cart-footer">
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle size={40} className="text-green-400" />
              <p className="text-sm font-semibold text-green-400">Đặt hàng thành công!</p>
              <p className="text-xs text-gray-400">Đơn hàng của bạn đang được xử lý.</p>
              <button
                onClick={() => setCheckoutSuccess(false)}
                className="mt-2 px-4 py-2 text-xs font-medium bg-surface-container border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
