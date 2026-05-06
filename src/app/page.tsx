import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shop/Navbar'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductRealtimeRefresh } from '@/components/shop/ProductRealtimeRefresh'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Gamepad2, Package, ShieldCheck, Truck } from 'lucide-react'
import type { Category, ProductWithCategory } from '@/types'

export const dynamic = 'force-dynamic'

const PERKS = [
  {
    icon: Package,
    title: 'Game Fisik Ori',
    desc: 'Semua produk bergaransi keaslian, bukan bajakan.',
  },
  {
    icon: Truck,
    title: 'Pengiriman ke Seluruh Indonesia',
    desc: 'Kami kirim ke semua kota besar dan daerah terpencil.',
  },
  {
    icon: ShieldCheck,
    title: 'Pembayaran Aman',
    desc: 'Transaksi diproses lewat Midtrans, terpercaya dan terenkripsi.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: featured } = await supabase
    .from('products')
    .select('*, categories(id, name, slug, description)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-zinc-950">
      <ProductRealtimeRefresh />
      <Navbar user={user ? { email: user.email ?? '' } : null} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-800/50 bg-blue-950/30 text-blue-400 text-xs font-medium">
              <Gamepad2 size={12} />
              Toko Game Fisik #1 di Indonesia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Game Favoritmu,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Dikirim ke Pintumu
              </span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Koleksi game fisik terlengkap untuk PlayStation, Xbox, Nintendo, dan PC.
              Semua produk original bergaransi.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/products">
                  Mulai Belanja
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Lihat Semua Produk</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Kategori</h2>
            <Link href="/products" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Semua kategori →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {(categories as Category[]).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="px-4 py-2 rounded-full border border-zinc-700 bg-zinc-800/50 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Produk Terbaru</h2>
          <Link
            href="/products"
            className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
          >
            Lihat semua <ArrowRight size={13} />
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(featured as ProductWithCategory[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
            <Gamepad2 size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">Produk segera hadir</p>
          </div>
        )}
      </section>

      {/* Perks */}
      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-zinc-800 text-blue-400 shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Gamepad2 size={15} className="text-blue-400" />
            <span className="font-medium text-zinc-400">GameShelf</span>
          </div>
          <p>© {new Date().getFullYear()} GameShelf. Toko game fisik terpercaya.</p>
        </div>
      </footer>
    </div>
  )
}
