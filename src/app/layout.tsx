import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'GameShelf — Toko Game Fisik Online',
  description: 'Temukan koleksi game fisik terlengkap — PS5, Xbox, Nintendo Switch, dan PC.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${inter.variable} dark`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  )
}
