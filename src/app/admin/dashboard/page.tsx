import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, Package, ShoppingBag, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered']

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  const [
    { data: orders },
    { data: lowStockProducts },
    { data: orderItems },
    { data: allProducts },
  ] = await Promise.all([
    admin.from('orders').select('total_amount, status'),
    admin
      .from('products')
      .select('id, name, slug, stock, images')
      .lte('stock', 5)
      .eq('is_active', true)
      .order('stock', { ascending: true }),
    admin
      .from('order_items')
      .select('quantity, orders!inner(status)')
      .in('orders.status', PAID_STATUSES),
    admin.from('products').select('id', { count: 'exact' }).eq('is_active', true),
  ])

  const totalRevenue = (orders ?? [])
    .filter((o) => PAID_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0)

  const totalSold = (orderItems ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  )

  const pendingCount = (orders ?? []).filter((o) => o.status === 'pending').length
  const totalProducts = allProducts?.length ?? 0

  const stats = [
    {
      label: 'Total Pendapatan',
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-950/40 border-green-900/50',
      desc: 'Dari pesanan yang sudah dibayar',
    },
    {
      label: 'Produk Terjual',
      value: `${totalSold} unit`,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-900/50',
      desc: 'Total item dari semua transaksi',
    },
    {
      label: 'Pesanan Pending',
      value: `${pendingCount} pesanan`,
      icon: Package,
      color: 'text-yellow-400',
      bg: 'bg-yellow-950/40 border-yellow-900/50',
      desc: 'Menunggu pembayaran dari customer',
    },
    {
      label: 'Total Produk Aktif',
      value: `${totalProducts} produk`,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-900/50',
      desc: 'Produk yang tampil di toko',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Ringkasan performa toko</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-5 space-y-3 ${stat.bg}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">{stat.label}</p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-zinc-600">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Warning */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
          <AlertTriangle size={15} className="text-yellow-400" />
          <h2 className="font-semibold text-white text-sm">Stok Menipis</h2>
          <span className="ml-auto text-xs text-zinc-500">
            {lowStockProducts?.length ?? 0} produk
          </span>
        </div>

        {!lowStockProducts || lowStockProducts.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-500 text-sm">
            Semua produk stoknya aman ✓
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {(lowStockProducts as any[]).map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-9 h-9 rounded-lg object-cover bg-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                      product.stock === 0
                        ? 'text-red-400 bg-red-950/40'
                        : 'text-yellow-400 bg-yellow-950/40'
                    }`}
                  >
                    {product.stock === 0 ? 'Habis' : `${product.stock} sisa`}
                  </span>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
