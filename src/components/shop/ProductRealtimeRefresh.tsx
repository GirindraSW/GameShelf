"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProductRealtimeRefreshProps {
  productId?: string
}

export function ProductRealtimeRefresh({ productId }: ProductRealtimeRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let refreshTimer: ReturnType<typeof setTimeout> | null = null

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => router.refresh(), 150)
    }

    const channel = supabase.channel(productId ? `product-refresh-${productId}` : 'products-refresh')

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        ...(productId ? { filter: `id=eq.${productId}` } : {}),
      },
      scheduleRefresh
    )

    channel.subscribe()

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      supabase.removeChannel(channel)
    }
  }, [productId, router])

  return null
}
