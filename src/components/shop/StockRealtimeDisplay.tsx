"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  initialStock: number
}

export function StockRealtimeDisplay({ productId, initialStock }: Props) {
  const [stock, setStock] = useState(initialStock)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const newStock = (payload.new as { stock: number }).stock
          if (typeof newStock === 'number') {
            setStock(newStock)
            // Refresh server components supaya AddToCartButton ikut update
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [productId, router])

  if (stock === 0) {
    return <span className="text-sm font-medium text-red-400">Stok habis</span>
  }

  return (
    <span className="text-sm text-zinc-400">
      Stok tersedia:{' '}
      <span className={stock <= 5 ? 'text-yellow-400 font-medium' : 'text-zinc-300'}>
        {stock} unit
      </span>
    </span>
  )
}
