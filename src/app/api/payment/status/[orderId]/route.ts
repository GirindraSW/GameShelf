import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { coreApi } from '@/lib/midtrans'
import { markOrderPaid } from '@/lib/orderUtils'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await params
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, status, midtrans_order_id, user_id')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  if (order.status !== 'pending') {
    return NextResponse.json({ status: order.status })
  }

  try {
    const midtransStatus = await coreApi.transaction.status(orderId)
    const { transaction_status, fraud_status } = midtransStatus

    console.log('[Status Check]', { orderId, transaction_status, fraud_status })

    const isPaid =
      transaction_status === 'capture' ||
      transaction_status === 'settlement' ||
      transaction_status === 'success'

    const isCancelled = ['cancel', 'deny', 'expire'].includes(transaction_status)

    let newStatus: string | null = null

    if (isPaid) {
      await markOrderPaid(orderId) // update status + kurangi stok (atomic)
      newStatus = 'paid'
    } else if (isCancelled) {
      await admin
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
      newStatus = 'cancelled'
    }

    return NextResponse.json({ status: newStatus ?? order.status, transaction_status })
  } catch (err: any) {
    console.error('[Status Check] Error:', err?.message ?? err)
    return NextResponse.json(
      { status: order.status, error: err?.message ?? 'Tidak dapat cek status Midtrans' },
      { status: 200 }
    )
  }
}
