"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductWithCategory } from '@/types'

interface ProductTableProps {
  products: ProductWithCategory[]
  currentPage: number
  totalPages: number
  searchQuery?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function ProductTable({ products, currentPage, totalPages, searchQuery }: ProductTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus produk "${name}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('Gagal menghapus produk. Coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  function pageUrl(page: number) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (searchQuery) params.set('q', searchQuery)
    return `/admin/products?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader className="[&_tr]:border-zinc-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Produk</TableHead>
              <TableHead className="text-zinc-400 font-medium">Kategori</TableHead>
              <TableHead className="text-zinc-400 font-medium">Harga</TableHead>
              <TableHead className="text-zinc-400 font-medium">Stok</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-zinc-800">
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500 py-16">
                  Belum ada produk
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="hover:bg-zinc-800/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-9 h-9 rounded-md object-cover bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-zinc-800 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-white text-sm leading-tight">{product.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {product.categories?.name ?? (
                      <span className="text-zinc-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-300 text-sm font-mono">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className={product.stock <= 5 ? 'text-red-400 font-medium' : 'text-zinc-300'}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-950/40"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Halaman {currentPage} dari {totalPages}</span>
          <div className="flex gap-2">
            {currentPage <= 1 ? (
              <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={pageUrl(currentPage - 1)}>Sebelumnya</Link>
              </Button>
            )}
            {currentPage >= totalPages ? (
              <Button variant="outline" size="sm" disabled>Berikutnya</Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={pageUrl(currentPage + 1)}>Berikutnya</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
