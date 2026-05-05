import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Menunggu Pembayaran', color: 'text-yellow-400 bg-yellow-950/40' },
  paid:       { label: 'Dibayar',             color: 'text-green-400 bg-green-950/40'  },
  processing: { label: 'Diproses',            color: 'text-blue-400 bg-blue-950/40'    },
  shipped:    { label: 'Dikirim',             color: 'text-blue-400 bg-blue-950/40'    },
  delivered:  { label: 'Selesai',             color: 'text-green-400 bg-green-950/40'  },
  cancelled:  { label: 'Dibatalkan',          color: 'text-red-400 bg-red-950/40'      },
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(quantity, price_at_purchase, products(name, images))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-white mb-6">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">Belum ada pesanan</p>
          <p className="text-zinc-600 text-sm mt-1">Yuk mulai belanja game favoritmu!</p>
          <Link
            href="/products"
            className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Lihat Produk →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders as any[]).map((order) => {
            const statusInfo = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending
            const firstItem = order.order_items?.[0]
            const itemCount = order.order_items?.length ?? 0

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 items-start min-w-0">
                    {firstItem?.products?.images?.[0] && (
                      <img
                        src={firstItem.products.images[0]}
                        alt={firstItem.products.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {firstItem?.products?.name ?? 'Pesanan'}
                        {itemCount > 1 && (
                          <span className="text-zinc-500 font-normal"> +{itemCount - 1} item</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <ChevronRight size={14} className="text-zinc-600" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
