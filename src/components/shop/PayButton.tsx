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
        onSuccess: async () => {
          // Otomatis update status + kurangi stok tanpa perlu klik tombol
          await fetch(`/api/payment/status/${orderId}`, { method: 'POST' })
          router.refresh()
        },
        onPending: () => {
          setLoading(false)
          router.refresh()
        },
        onError: () => {
          setError('Pembayaran gagal. Coba lagi.')
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  async function handleCheckStatus() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/payment/status/${orderId}`, { method: 'POST' })
      const data = await res.json()
      if (data.status && data.status !== 'pending') {
        router.refresh()
      } else {
        setError('Pembayaran belum dikonfirmasi Midtrans. Coba lagi dalam beberapa saat.')
      }
    } catch {
      setError('Gagal cek status')
    } finally {
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
        <Button
          onClick={handleCheckStatus}
          disabled={loading}
          variant="outline"
          className="w-full text-xs"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          Cek Status Pembayaran
        </Button>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    </>
  )
}
