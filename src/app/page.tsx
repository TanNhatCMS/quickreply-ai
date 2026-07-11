import dynamic from 'next/dynamic'
import TopNavBar from '@/components/home/TopNavBar'
import HeroSection from '@/components/home/HeroSection'
import CategoryBarWrapper from '@/components/home/CategoryBarWrapper'
import ProductGrid from '@/components/home/ProductGrid'
import HomeFooter from '@/components/home/HomeFooter'

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false })
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false })

export default function HomePage() {
  return (
    <div className="theme-titanium bg-surface-blue text-on-surface min-h-screen">
      <TopNavBar />
      <CartDrawer />
      <main className="pt-28 pb-16 px-[var(--spacing-margin-edge)] w-full max-w-[var(--spacing-container-max)] mx-auto space-y-[var(--spacing-stack-lg)]">
        <HeroSection />
        <section className="space-y-[var(--spacing-stack-md)]">
          <CategoryBarWrapper />
        </section>
        <ProductGrid />
      </main>
      <HomeFooter />
      <ChatWidget />
    </div>
  )
}
