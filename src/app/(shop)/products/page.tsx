import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductFilters } from '@/components/shop/ProductFilters'
import { ProductRealtimeRefresh } from '@/components/shop/ProductRealtimeRefresh'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { ProductWithCategory } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12
type CategoryIdResult = { data: { id: string } | null }

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; page?: string }>
}) {
  const { category, q, sort = 'newest', page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const [{ data: categories }, categoryResult] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    category
      ? supabase.from('categories').select('id').eq('slug', category).single()
      : Promise.resolve({ data: null } satisfies CategoryIdResult),
  ])

  const categoryId = (categoryResult as CategoryIdResult).data?.id

  let query = supabase
    .from('products')
    .select('*, categories(id, name, slug, description)', { count: 'exact' })
    .eq('is_active', true)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (q) query = query.ilike('name', `%${q}%`)

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'name') query = query.order('name', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  query = query.range(from, to)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (sort !== 'newest') params.set('sort', sort)
    params.set('page', String(p))
    return `/products?${params.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <ProductRealtimeRefresh />
      <ProductFilters
        categories={categories ?? []}
        activeCategory={category}
        activeSort={sort}
        searchQuery={q}
      />

      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(products as ProductWithCategory[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              {currentPage > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(currentPage - 1)}>← Sebelumnya</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>← Sebelumnya</Button>
              )}
              <span className="text-sm text-zinc-500">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(currentPage + 1)}>Berikutnya →</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Berikutnya →</Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-lg font-medium text-zinc-400">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      )}
    </div>
  )
}
