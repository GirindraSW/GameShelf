import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PayButton } from '@/components/shop/PayButton'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Order, ShippingAddress } from '@/types'

type OrderWithItems = Order & {
  order_items: { id: string; product_id: string; quantity: number; price_at_purchase: number; products: { name: string; images: string[] } | null }[]
}

const STATUS_MAP = {
  pending:    { label: 'Menunggu Pembayaran', icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-900/50' },
  paid:       { label: 'Pembayaran Berhasil', icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-950/40 border-green-900/50'  },
  processing: { label: 'Sedang Diproses',     icon: Package,      color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50'    },
  shipped:    { label: 'Sedang Dikirim',      icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-900/50'    },
  delivered:  { label: 'Pesanan Tiba',        icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-950/40 border-green-900/50'  },
  cancelled:  { label: 'Dibatalkan',          icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-950/40 border-red-900/50'      },
} as const

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const typedOrder = order as unknown as OrderWithItems
  const shipping = typedOrder.shipping_address as unknown as ShippingAddress
  const status = STATUS_MAP[typedOrder.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending
  const StatusIcon = status.icon

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${status.bg.split(' ')[0]}`}>
          <StatusIcon size={32} className={status.color} />
        </div>
        <h1 className="text-2xl font-bold text-white">{status.label}</h1>
        <p className="text-xs text-zinc-600 mt-2 font-mono">#{typedOrder.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="space-y-4">
        {/* Items */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={15} />
            Item Pesanan
          </h2>
          <div className="space-y-3">
            {(typedOrder.order_items as any[]).map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                {item.products?.images?.[0] && (
                  <img
                    src={item.products.images[0]}
                    alt={item.products.name}
                    className="w-10 h-10 rounded-md object-cover bg-zinc-800 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.products?.name}</p>
                  <p className="text-xs text-zinc-500">
                    {item.quantity}× {formatPrice(item.price_at_purchase)}
                  </p>
                </div>
                <p className="text-sm font-medium text-white shrink-0">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-3 flex justify-between">
            <span className="font-semibold text-white">Total</span>
            <span className="font-bold text-white">{formatPrice(typedOrder.total_amount)}</span>
          </div>
        </div>

        {/* Alamat */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-1.5">
          <h2 className="font-semibold text-white mb-3">Alamat Pengiriman</h2>
          <p className="text-sm text-zinc-300">{shipping.full_name}</p>
          <p className="text-sm text-zinc-400">{shipping.phone}</p>
          <p className="text-sm text-zinc-400">
            {shipping.address}, {shipping.city}, {shipping.province} {shipping.postal_code}
          </p>
        </div>

        {/* CTA berdasarkan status */}
        <div className={`rounded-xl border p-5 space-y-3 ${status.bg}`}>
          <p className={`text-sm font-medium text-center ${status.color}`}>{status.label}</p>

          {typedOrder.status === 'pending' && (
            <PayButton orderId={typedOrder.id} />
          )}

          <Button asChild variant="ghost" className="w-full text-zinc-400">
            <Link href="/products">← Lanjut Belanja</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
