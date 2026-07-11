import TopNavBar from '@/components/home/TopNavBar'
import HeroSection from '@/components/home/HeroSection'
import CategoryBarWrapper from '@/components/home/CategoryBarWrapper'
import ProductGrid from '@/components/home/ProductGrid'
import HomeFooter from '@/components/home/HomeFooter'
import ClientWidgets from '@/components/home/ClientWidgets'

export default function HomePage() {
  return (
    <div className="theme-titanium bg-surface-blue text-on-surface min-h-screen">
      <TopNavBar />
      <ClientWidgets />
      <main className="pt-28 pb-16 px-margin-edge w-full max-w-container-max mx-auto space-y-stack-lg">
        <HeroSection />
        <section className="space-y-stack-md">
          <CategoryBarWrapper />
        </section>
        <ProductGrid />
      </main>
      <HomeFooter />
    </div>
  )
}
