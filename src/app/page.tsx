'use client'

import dynamic from 'next/dynamic'
import { ShoppingCart, Monitor, Cpu, Wifi, Shield, ChevronRight, Star } from 'lucide-react'
import { useCartStore, selectCartCount } from '@/store/useCartStore'

// Dynamic imports — avoid SSR for client-only components
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false })
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false })

// ─── Mock featured categories ──────────────────────────────────────────────

const categories = [
  { label: 'Laptop Gaming', icon: Cpu, color: 'from-violet-600 to-purple-700', count: 24 },
  { label: 'Laptop Văn phòng', icon: Monitor, color: 'from-blue-600 to-cyan-600', count: 38 },
  { label: 'Ultrabook', icon: Wifi, color: 'from-emerald-600 to-teal-600', count: 15 },
  { label: 'Bảo hành chính hãng', icon: Shield, color: 'from-amber-500 to-orange-600', count: 12 },
]

// ─── Mock hero products (displayed in the banner) ──────────────────────────

const heroProducts = [
  {
    id: 'hero-1',
    name: 'MacBook Air M2',
    brand: 'Apple',
    price: '27.990.000đ',
    badge: 'Bán chạy',
    badgeColor: 'bg-emerald-500',
    gradient: 'from-gray-800 to-gray-900',
    accent: 'text-blue-400',
  },
  {
    id: 'hero-2',
    name: 'ASUS ROG Strix G16',
    brand: 'ASUS',
    price: '32.990.000đ',
    badge: 'Gaming',
    badgeColor: 'bg-red-500',
    gradient: 'from-slate-900 to-red-950',
    accent: 'text-red-400',
  },
  {
    id: 'hero-3',
    name: 'Dell XPS 15',
    brand: 'Dell',
    price: '45.990.000đ',
    badge: 'Premium',
    badgeColor: 'bg-indigo-500',
    gradient: 'from-gray-900 to-indigo-950',
    accent: 'text-indigo-400',
  },
]

// ─── Header component ──────────────────────────────────────────────────────

function StorefrontHeader() {
  const cartCount = useCartStore(selectCartCount)
  const toggleDrawer = useCartStore((s) => s.toggleDrawer)

  return (
    <header className="storefront-header">
      <div className="storefront-header-inner">
        {/* Logo */}
        <div className="storefront-logo">
          <div className="logo-mark">PV</div>
          <div>
            <p className="logo-title">Phong Vũ</p>
            <p className="logo-subtitle">Technology Store</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="storefront-nav" aria-label="Main navigation">
          {['Laptop', 'PC & Server', 'Phụ kiện', 'Khuyến mãi', 'Bảo hành'].map((item) => (
            <a key={item} href="#" className="nav-link">
              {item}
            </a>
          ))}
        </nav>

        {/* Cart button */}
        <button
          id="cart-header-btn"
          onClick={() => toggleDrawer()}
          className="cart-header-btn"
          aria-label="Mở giỏ hàng"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="cart-header-count">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="storefront-root">
      <StorefrontHeader />

      <main>
        {/* ── Hero Section ── */}
        <section className="hero-section" aria-label="Sản phẩm nổi bật">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-badge">
                <Star size={12} className="text-yellow-400" />
                <span>Được tư vấn bởi QuickReply AI</span>
              </div>
              <h1 className="hero-title">
                Tìm laptop <span className="hero-title-accent">hoàn hảo</span> cho bạn
              </h1>
              <p className="hero-description">
                Hỏi trợ lý AI để được tư vấn sản phẩm phù hợp với nhu cầu, ngân sách và phong cách làm việc của bạn.
              </p>
              <div className="hero-cta-group">
                <button className="hero-cta-primary">
                  Hỏi AI ngay
                  <ChevronRight size={16} />
                </button>
                <a href="#products" className="hero-cta-secondary">
                  Xem sản phẩm
                </a>
              </div>
            </div>

            {/* Featured product cards */}
            <div className="hero-cards" aria-label="Sản phẩm tiêu biểu">
              {heroProducts.map((p) => (
                <div key={p.id} className={`hero-product-card bg-gradient-to-br ${p.gradient}`}>
                  <span className={`hero-product-badge ${p.badgeColor}`}>{p.badge}</span>
                  <p className={`hero-product-brand ${p.accent}`}>{p.brand}</p>
                  <p className="hero-product-name">{p.name}</p>
                  <p className="hero-product-price">{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="categories-section" id="products" aria-label="Danh mục sản phẩm">
          <div className="section-inner">
            <h2 className="section-title">Danh mục nổi bật</h2>
            <div className="categories-grid">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.label}
                    className="category-card"
                    aria-label={cat.label}
                  >
                    <div className={`category-icon-wrap bg-gradient-to-br ${cat.color}`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="category-info">
                      <p className="category-label">{cat.label}</p>
                      <p className="category-count">{cat.count} sản phẩm</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 ml-auto" />
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── AI Promo Banner ── */}
        <section className="ai-promo-section" aria-label="Tính năng AI">
          <div className="section-inner">
            <div className="ai-promo-card">
              <div className="ai-promo-content">
                <div className="ai-promo-icon">🤖</div>
                <div>
                  <h2 className="ai-promo-title">Tư vấn AI thông minh — Miễn phí</h2>
                  <p className="ai-promo-desc">
                    Chat với QuickReply AI để so sánh sản phẩm, tìm khuyến mãi và kiểm tra
                    chính sách bảo hành chỉ trong vài giây.
                  </p>
                </div>
              </div>
              <div className="ai-promo-features">
                {[
                  '✅ Tư vấn cấu hình theo ngân sách',
                  '✅ So sánh sản phẩm chi tiết',
                  '✅ Khuyến mãi & bảo hành realtime',
                  '✅ Thêm giỏ hàng ngay từ chat',
                ].map((f) => (
                  <p key={f} className="ai-promo-feature">{f}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="storefront-footer">
        <p className="text-center text-gray-600 text-sm">
          © 2025 Phong Vũ Technology — QuickReply AI Demo (Hackathon MVP)
        </p>
      </footer>

      {/* ── Floating AI Chat Widget ── */}
      <ChatWidget />

      {/* ── Cart Drawer ── */}
      <CartDrawer />
    </div>
  )
}
