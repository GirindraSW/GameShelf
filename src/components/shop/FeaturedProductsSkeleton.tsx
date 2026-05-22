// Skeleton khusus untuk section featured products
export function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[4/3] rounded-xl bg-zinc-800 animate-pulse" />
          <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
          <div className="h-4 w-full rounded bg-zinc-800 animate-pulse" />
          <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
