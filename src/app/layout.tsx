import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phong Vũ Store | QuickReply AI — Tư vấn mua sắm thông minh',
  description:
    'Khám phá laptop, máy tính và phụ kiện công nghệ tại Phong Vũ với sự hỗ trợ của trợ lý AI thông minh QuickReply.',
  keywords: ['laptop', 'máy tính', 'Phong Vũ', 'AI tư vấn', 'mua sắm trực tuyến'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
