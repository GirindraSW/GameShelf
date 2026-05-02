"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin/products', icon: Package, label: 'Produk' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Order' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      <div className="p-5 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Admin Panel</p>
        <h1 className="text-base font-semibold text-white">GameShelf</h1>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors w-full"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
