'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false })
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false })

export default function ClientWidgets() {
  return (
    <>
      <CartDrawer />
      <ChatWidget />
    </>
  )
}
