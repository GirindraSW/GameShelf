import { createClient } from '@/lib/supabase/server'
import { ProductTable } from '@/components/admin/ProductTable'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

const PAGE_SIZE = 10

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page = '1', q } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug, description)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: products, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Produk</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{count ?? 0} total produk</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus size={15} />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <ProductTable
        products={products ?? []}
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={q}
      />
    </div>
  )
}
