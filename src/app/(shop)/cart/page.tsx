"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const totalItems = useCartStore((state) => state.totalItems)
  const totalPrice = useCartStore((state) => state.totalPrice)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-48 rounded-lg bg-zinc-800 animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-zinc-700 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Keranjang kosong</h1>
        <p className="text-sm text-zinc-500 mb-6">Belum ada produk yang ditambahkan</p>
        <Button asChild>
          <Link href="/products">Mulai Belanja</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-white mb-6">
        Keranjang{' '}
        <span className="text-zinc-500 font-normal text-base">({totalItems()} item)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List item */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover bg-zinc-800 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-zinc-800 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm leading-snug line-clamp-2">
                  {item.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{formatPrice(item.price)} / item</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm text-white font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 sticky top-20 space-y-4">
            <h2 className="font-semibold text-white">Ringkasan Order</h2>

            <div className="space-y-2 text-sm border-b border-zinc-800 pb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between gap-2 text-zinc-400">
                  <span className="truncate">
                    {item.name}{' '}
                    <span className="text-zinc-600">×{item.quantity}</span>
                  </span>
                  <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-white text-xl">{formatPrice(totalPrice())}</span>
            </div>

            <Button asChild className="w-full gap-2">
              <Link href="/checkout">
                Lanjut ke Checkout
                <ArrowRight size={15} />
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full text-zinc-400">
              <Link href="/products">← Lanjut Belanja</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
