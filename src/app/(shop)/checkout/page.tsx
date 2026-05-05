"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cartStore'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { formatPrice } from '@/lib/utils'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice)
  const clearCart = useCartStore((state) => state.clearCart)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/cart')
    }
  }, [mounted, items.length, router])

  if (!mounted || items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-32 rounded-lg bg-zinc-800 animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-64 rounded-xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    )
  }

  async function onSubmit(data: CheckoutInput) {
    setSubmitError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address: data, items }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Terjadi kesalahan')
      }

      const { order_id } = await res.json()
      clearCart()
      router.push(`/orders/${order_id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form alamat */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
            <h2 className="font-semibold text-white">Alamat Pengiriman</h2>

            <Field label="Nama Lengkap" error={errors.full_name?.message}>
              <Input {...register('full_name')} placeholder="Nama penerima" />
            </Field>

            <Field label="Nomor HP" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="08xxxxxxxxxx" type="tel" />
            </Field>

            <Field label="Alamat Lengkap" error={errors.address?.message}>
              <textarea
                {...register('address')}
                rows={3}
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Kota" error={errors.city?.message}>
                <Input {...register('city')} placeholder="Nama kota" />
              </Field>
              <Field label="Provinsi" error={errors.province?.message}>
                <Input {...register('province')} placeholder="Nama provinsi" />
              </Field>
            </div>

            <Field label="Kode Pos" error={errors.postal_code?.message}>
              <Input
                {...register('postal_code')}
                placeholder="12345"
                maxLength={5}
                className="max-w-[140px]"
              />
            </Field>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 sticky top-20 space-y-4">
            <h2 className="font-semibold text-white">Ringkasan Pesanan</h2>

            <div className="space-y-3 border-b border-zinc-800 pb-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 items-start">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-md object-cover bg-zinc-800 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 leading-snug line-clamp-2">{item.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.quantity}× {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-white shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-white text-xl">{formatPrice(totalPrice())}</span>
            </div>

            {submitError && <p className="text-xs text-red-400">{submitError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
            </Button>

            <Button type="button" variant="ghost" className="w-full text-zinc-400" asChild>
              <Link href="/cart">← Kembali ke Keranjang</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
