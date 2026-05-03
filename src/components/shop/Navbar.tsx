"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, ShoppingCart, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user: { email: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/products"
          className="flex items-center gap-2 font-semibold text-white shrink-0"
        >
          <Gamepad2 size={18} className="text-blue-400" />
          GameShelf
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/products"
            className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Produk
          </Link>
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          {/* Cart — wired up Day 3 */}
          <Link
            href="/cart"
            className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800"
          >
            <ShoppingCart size={17} />
          </Link>

          {user ? (
            <>
              <Link
                href="/orders"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <User size={14} />
                Pesanan
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-zinc-800"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
