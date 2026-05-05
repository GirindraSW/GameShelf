import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // Tentukan status order berdasarkan notifikasi Midtrans
  let orderStatus: string | null = null

  if (
    (transaction_status === 'capture' && fraud_status === 'accept') ||
    transaction_status === 'settlement'
  ) {
    orderStatus = 'paid'
  } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
    orderStatus = 'cancelled'
  } else if (transaction_status === 'pending') {
    orderStatus = 'pending'
  }

  const admin = createAdminClient()

  // Log semua notifikasi masuk
  await admin.from('payment_logs').insert({
    order_id,
    midtrans_transaction_id: transaction_id,
    status: transaction_status,
    raw_response: body,
  })

  if (!orderStatus) return NextResponse.json({ ok: true })

  // Update status order
  const { data: order } = await admin
    .from('orders')
    .update({ status: orderStatus, updated_at: new Date().toISOString() })
    .eq('id', order_id)
    .select('*, order_items(*)')
    .single()

  // Kurangi stok saat order paid
  if (orderStatus === 'paid' && order) {
    for (const item of order.order_items as any[]) {
      const { data: product } = await admin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (product && product.stock >= item.quantity) {
        await admin
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
