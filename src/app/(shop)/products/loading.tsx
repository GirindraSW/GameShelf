// Otomatis tampil saat /products sedang fetch data dari Supabase
export default function ProductsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Filter skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-full rounded-lg bg-zinc-800 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] rounded-xl bg-zinc-800 animate-pulse" />
            <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-full rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
