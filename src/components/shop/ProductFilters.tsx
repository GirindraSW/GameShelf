"use client"

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import type { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
  activeCategory?: string
  activeSort?: string
  searchQuery?: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah → Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi → Rendah' },
  { value: 'name', label: 'Nama A–Z' },
]

export function ProductFilters({
  categories,
  activeCategory,
  activeSort = 'newest',
  searchQuery = '',
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(searchQuery)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timeout = setTimeout(() => {
      updateParams({ q: search || undefined })
    }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); updateParams({ q: undefined }) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ category: undefined })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <select
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
