"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void
          onPending?: (result: unknown) => void
          onError?: (result: unknown) => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

interface PayButtonProps {
  orderId: string
}

export function PayButton({ orderId }: PayButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal membuat transaksi')
      }

      const { snap_token } = await res.json()

      window.snap.pay(snap_token, {
        onSuccess: () => router.refresh(),
        onPending: () => router.refresh(),
        onError: () => setError('Pembayaran gagal. Coba lagi.'),
        onClose: () => setLoading(false),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="space-y-2">
        <Button onClick={handlePay} disabled={loading} className="w-full gap-2">
          {loading
            ? <Loader2 size={15} className="animate-spin" />
            : <CreditCard size={15} />}
          {loading ? 'Memproses...' : 'Bayar Sekarang'}
        </Button>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    </>
  )
}
