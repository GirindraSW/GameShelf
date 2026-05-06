import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import { formatPrice } from '@/lib/utils'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  pending:    'Belum Dibayar',
  paid:       'Sudah Dibayar',
  processing: 'Dikemas',
  shipped:    'Dikirim',
  delivered:  'Selesai',
  cancelled:  'Dibatalkan',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('*, order_items(id, product_id, quantity, price_at_purchase, products(name, images))')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Pesanan Masuk</h1>
        <p className="text-sm text-zinc-400 mt-0.5">{orders?.length ?? 0} total pesanan</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders as any[]).map((order) => {
            const items = order.order_items ?? []
            const firstItem = items[0]

            return (
              <div key={order.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex gap-3 items-start min-w-0">
                    {firstItem?.products?.images?.[0] && (
                      <img
                        src={firstItem.products.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-white mt-0.5">
                        {firstItem?.products?.name ?? 'Pesanan'}
                        {items.length > 1 && (
                          <span className="text-zinc-500"> +{items.length - 1} item</span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {formatPrice(order.total_amount)}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <p className="text-xs text-zinc-500 mb-1.5">Status Pesanan</p>
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>

                {/* Items detail */}
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1.5">
                  {items.map((item: any) => (
                    <div key={item.id ?? item.product_id} className="flex justify-between text-xs text-zinc-400">
                      <span>{item.products?.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
