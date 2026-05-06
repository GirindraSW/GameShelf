import {
  ShoppingBag,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

interface Step {
  key: string
  label: string
  sublabel: string
  icon: LucideIcon
}

const STEPS: Step[] = [
  { key: 'pending',    label: 'Pesanan Dibuat',     sublabel: 'Pesanan berhasil masuk',      icon: ShoppingBag   },
  { key: 'paid',       label: 'Pembayaran Lunas',   sublabel: 'Pembayaran dikonfirmasi',     icon: CreditCard    },
  { key: 'processing', label: 'Dikemas',             sublabel: 'Pesanan sedang disiapkan',   icon: Package       },
  { key: 'shipped',    label: 'Dikirim',             sublabel: 'Dalam perjalanan ke kamu',   icon: Truck         },
  { key: 'delivered',  label: 'Selesai',             sublabel: 'Pesanan sudah diterima',     icon: CheckCircle2  },
]

const STATUS_INDEX: Record<string, number> = {
  pending: 0, paid: 1, processing: 2, shipped: 3, delivered: 4,
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  status: string
  createdAt: string
  updatedAt: string
}

export function OrderTimeline({ status, createdAt, updatedAt }: Props) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-xl bg-zinc-900 border border-red-900/40 p-5 text-center">
        <p className="text-red-400 font-semibold">Pesanan Dibatalkan</p>
        <p className="text-xs text-zinc-500 mt-1">{formatDate(updatedAt)}</p>
      </div>
    )
  }

  const currentIndex = STATUS_INDEX[status] ?? 0

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
      <p className="text-sm font-semibold text-zinc-300 mb-6">Tracking Pesanan</p>

      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent   = index === currentIndex
          const isLast      = index === STEPS.length - 1

          const circleClass = isCompleted
            ? isCurrent
              ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/50'
              : 'bg-green-600 border-green-500'
            : 'bg-zinc-800 border-zinc-700'

          const iconClass   = isCompleted ? 'text-white' : 'text-zinc-600'
          const labelClass  = isCompleted ? (isCurrent ? 'text-blue-400' : 'text-green-400') : 'text-zinc-500'

          return (
            <div key={step.key} className="flex items-start flex-1">
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${circleClass}`}>
                  <step.icon size={18} className={iconClass} />
                </div>
                {/* Label */}
                <p className={`text-xs font-semibold mt-2.5 text-center leading-tight ${labelClass}`}>
                  {step.label}
                </p>
                {/* Sublabel */}
                <p className="text-[10px] text-zinc-600 text-center mt-0.5 leading-tight px-1">
                  {step.sublabel}
                </p>
                {/* Timestamp */}
                {isCompleted && (
                  <p className="text-[10px] text-zinc-500 mt-1 text-center">
                    {step.key === 'pending' ? formatDate(createdAt) : isCurrent ? formatDate(updatedAt) : ''}
                  </p>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 flex items-center mt-5 px-1">
                  <div className={`h-0.5 w-full transition-all duration-500 ${
                    index < currentIndex ? 'bg-green-600' : 'bg-zinc-700'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden flex-col gap-0">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent   = index === currentIndex
          const isLast      = index === STEPS.length - 1

          const circleClass = isCompleted
            ? isCurrent
              ? 'bg-blue-600 border-blue-500'
              : 'bg-green-600 border-green-500'
            : 'bg-zinc-800 border-zinc-700'

          const iconClass  = isCompleted ? 'text-white' : 'text-zinc-600'
          const labelClass = isCompleted ? (isCurrent ? 'text-blue-400' : 'text-green-400') : 'text-zinc-500'

          return (
            <div key={step.key} className="flex gap-3">
              {/* Left: circle + line */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${circleClass}`}>
                  <step.icon size={15} className={iconClass} />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                    index < currentIndex ? 'bg-green-600' : 'bg-zinc-700'
                  }`} />
                )}
              </div>

              {/* Right: text */}
              <div className={`pb-5 ${isLast ? '' : ''}`}>
                <p className={`text-xs font-semibold leading-tight ${labelClass}`}>{step.label}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{step.sublabel}</p>
                {isCompleted && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {step.key === 'pending' ? formatDate(createdAt) : isCurrent ? formatDate(updatedAt) : ''}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
