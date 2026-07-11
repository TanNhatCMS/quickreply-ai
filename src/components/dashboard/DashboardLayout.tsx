'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: 'forum' },
  { href: '/dashboard/orders', label: 'Orders', icon: 'shopping_cart' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {/* Side Navigation */}
      <nav className="flex flex-col w-64 fixed left-0 top-0 h-screen overflow-y-auto bg-surface-container-low border-r border-outline-variant z-50">
        <div className="p-md">
          <h1 className="text-headline-sm font-bold text-primary">
            QuickReply AI
          </h1>
          <div className="mt-base flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
              PV
            </div>
            <div>
              <p className="text-label-md text-on-surface">Phong Vu (Admin)</p>
              <p className="text-[10px] text-on-surface-variant">
                Dashboard v1.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 mt-md px-sm space-y-xs">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-sm px-sm py-xs rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary font-bold bg-surface-container-high border-r-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-label-md">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-md border-t border-outline-variant">
          <div className="bg-surface-container-high p-xs rounded-lg text-center">
            <span className="text-label-sm text-primary">v1.0.0-mvp</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-gutter min-h-screen">
        <div className="max-w-container-max mx-auto">{children}</div>
      </main>
    </div>
  )
}
