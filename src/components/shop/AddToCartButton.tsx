"use client"

import { useEffect, useState } from 'react'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    images: string[]
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const [stock, setStock] = useState(product.stock)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`cart-stock-${product.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${product.id}` },
        (payload) => {
          const nextStock = (payload.new as { stock?: number }).stock
          if (typeof nextStock === 'number') {
            setStock(nextStock)
            setQuantity((q) => Math.min(q, nextStock || 1))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [product.id])

  if (stock === 0) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Stok Habis
      </Button>
    )
  }

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1))
  }

  function increment() {
    setQuantity((q) => Math.min(stock, q + 1))
  }

  function handleAdd() {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] ?? null,
      stock,
    })
    setAdded(true)
    setQuantity(1)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Quantity selector */}
      <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 overflow-hidden">
        <button
          onClick={decrement}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-white select-none">
          {quantity}
        </span>
        <button
          onClick={increment}
          disabled={quantity >= stock}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Add to cart button */}
      <Button size="lg" onClick={handleAdd} className="gap-2 w-full sm:w-auto">
        {added ? <Check size={16} /> : <ShoppingCart size={16} />}
        {added ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
      </Button>
    </div>
  )
}
