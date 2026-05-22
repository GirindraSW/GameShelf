export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 rounded-lg bg-zinc-800 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
                <div className="h-4 w-48 rounded bg-zinc-800 animate-pulse" />
                <div className="h-4 w-24 rounded bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-8 w-32 rounded-lg bg-zinc-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
