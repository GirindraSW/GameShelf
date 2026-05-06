import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { markOrderPaid } from '@/lib/orderUtils'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    order_id,
    transaction_status,
    fraud_status,
    status_code,
    gross_amount,
    signature_key,
    transaction_id,
  } = body

  // Verifikasi signature Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex')

  if (expectedSignature !== signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Log semua notifikasi masuk
  await admin.from('payment_logs').insert({
    order_id,
    midtrans_transaction_id: transaction_id,
    status: transaction_status,
    raw_response: body,
  })

  const isPaid =
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement' ||
    transaction_status === 'success'

  const isCancelled = ['cancel', 'deny', 'expire'].includes(transaction_status)

  if (isPaid) {
    await markOrderPaid(order_id)
  } else if (isCancelled) {
    await admin
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order_id)
  }

  return NextResponse.json({ ok: true })
}
