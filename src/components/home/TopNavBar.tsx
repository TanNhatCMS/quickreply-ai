'use client'

import { useCartStore, selectCartCount } from '@/store/useCartStore'

export default function TopNavBar() {
  const cartCount = useCartStore(selectCartCount)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80">
      <div className="max-w-[var(--spacing-container-max)] mx-auto px-[var(--spacing-margin-edge)] h-20 flex items-center justify-between">
        <span className="text-xl font-bold text-primary tracking-tight">
          Phong Vũ
        </span>

        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Bạn muốn tìm gì..."
            className="rounded-full bg-surface-container-low border border-outline-variant/50 py-2.5 pl-4 pr-12 text-body-lg w-80 focus:outline-none focus:border-primary"
          />
          <span className="material-symbols-outlined absolute right-4 text-on-surface-variant">
            search
          </span>
        </div>

        <nav className="hidden lg:flex gap-6">
          {['Build PC', 'Khuyến Mãi', 'Trả Góp', 'Tin Tức', 'Liên Hệ'].map(
            (label) => (
              <a
                key={label}
                href="#"
                className="text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              >
                {label}
              </a>
            ),
          )}
        </nav>

        <button
          onClick={() => toggleDrawer(true)}
          className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">
            shopping_cart
          </span>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
