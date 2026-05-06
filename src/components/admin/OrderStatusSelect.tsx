"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Belum Dibayar' },
  { value: 'paid',       label: 'Sudah Dibayar' },
  { value: 'processing', label: 'Dikemas' },
  { value: 'shipped',    label: 'Dikirim' },
  { value: 'delivered',  label: 'Selesai' },
  { value: 'cancelled',  label: 'Dibatalkan' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:    'text-yellow-400',
  paid:       'text-blue-400',
  processing: 'text-purple-400',
  shipped:    'text-cyan-400',
  delivered:  'text-green-400',
  cancelled:  'text-red-400',
}

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function handleChange(newStatus: string) {
    if (newStatus === status) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setStatus(newStatus)
      router.refresh()
    } catch {
      alert('Gagal update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 size={13} className="animate-spin text-zinc-500 shrink-0" />}
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1 text-xs font-medium focus:outline-none disabled:opacity-50 ${STATUS_COLOR[status] ?? 'text-zinc-300'}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-white bg-zinc-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
