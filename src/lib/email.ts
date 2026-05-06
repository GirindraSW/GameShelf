import { Resend } from 'resend'
import { formatPrice } from './utils'
import type { CartItem, ShippingAddress } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderEmailData {
  orderId: string
  userEmail: string
  items: CartItem[]
  totalAmount: number
  shippingAddress: ShippingAddress
}

function orderConfirmationTemplate(data: OrderEmailData): string {
  const { orderId, items, totalAmount, shippingAddress } = data
  const shortId = orderId.slice(0, 8).toUpperCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #27272a;font-size:14px;color:#a1a1aa;">
        ${item.name}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #27272a;font-size:14px;color:#a1a1aa;text-align:center;">
        ${item.quantity}×
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #27272a;font-size:14px;color:#fff;text-align:right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;">
      <p style="font-size:22px;font-weight:700;color:#fff;margin:0;">🎮 GameShelf</p>
      <p style="font-size:13px;color:#71717a;margin:6px 0 0;">Toko Game Fisik Terpercaya</p>
    </div>

    <!-- Card -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
      <p style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;">Pesanan Dikonfirmasi!</p>
      <p style="font-size:13px;color:#71717a;margin:0 0 24px;">
        Halo ${shippingAddress.full_name}, pesanan kamu sudah berhasil dibuat.
      </p>

      <div style="background:#09090b;border-radius:10px;padding:16px;margin-bottom:24px;">
        <p style="font-size:12px;color:#52525b;margin:0 0 4px;">NOMOR PESANAN</p>
        <p style="font-size:18px;font-weight:700;color:#3b82f6;margin:0;letter-spacing:1px;">#${shortId}</p>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        ${itemRows}
      </table>

      <!-- Total -->
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #27272a;">
        <span style="font-size:15px;font-weight:600;color:#fff;">Total</span>
        <span style="font-size:18px;font-weight:700;color:#fff;">${formatPrice(totalAmount)}</span>
      </div>

      <!-- Shipping -->
      <div style="background:#09090b;border-radius:10px;padding:16px;margin-top:20px;">
        <p style="font-size:12px;color:#52525b;margin:0 0 8px;">ALAMAT PENGIRIMAN</p>
        <p style="font-size:14px;color:#e4e4e7;margin:0 0 2px;">${shippingAddress.full_name}</p>
        <p style="font-size:13px;color:#a1a1aa;margin:0 0 2px;">${shippingAddress.phone}</p>
        <p style="font-size:13px;color:#a1a1aa;margin:0;">
          ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.province} ${shippingAddress.postal_code}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px;">
        <a href="${appUrl}/orders/${orderId}"
          style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">
          Bayar Sekarang
        </a>
        <p style="font-size:12px;color:#52525b;margin:16px 0 0;">
          Atau buka: ${appUrl}/orders/${orderId}
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:12px;color:#3f3f46;padding:24px 0;">
      © ${new Date().getFullYear()} GameShelf. Email ini dikirim otomatis, jangan dibalas.
    </p>
  </div>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    await resend.emails.send({
      from: 'GameShelf <onboarding@resend.dev>',
      to: data.userEmail,
      subject: `Pesanan #${data.orderId.slice(0, 8).toUpperCase()} berhasil dibuat — GameShelf`,
      html: orderConfirmationTemplate(data),
    })
  } catch (err) {
    console.error('[Resend] Failed to send order confirmation:', err)
  }
}

// ─── Payment Success Email ────────────────────────────────────────────────────

interface PaidEmailData {
  orderId: string
  userEmail: string
  customerName: string
  totalAmount: number
  itemCount: number
}

function orderPaidTemplate(data: PaidEmailData): string {
  const { orderId, customerName, totalAmount, itemCount } = data
  const shortId = orderId.slice(0, 8).toUpperCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;">
      <p style="font-size:22px;font-weight:700;color:#fff;margin:0;">🎮 GameShelf</p>
      <p style="font-size:13px;color:#71717a;margin:6px 0 0;">Toko Game Fisik Terpercaya</p>
    </div>

    <!-- Card -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;text-align:center;">

      <!-- Checkmark -->
      <div style="width:64px;height:64px;background:#052e16;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <span style="font-size:32px;">✅</span>
      </div>

      <p style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">
        Pembayaran Berhasil!
      </p>
      <p style="font-size:15px;color:#a1a1aa;margin:0 0 28px;">
        Terima kasih, <strong style="color:#fff;">${customerName}</strong>! 🎉<br>
        Pesananmu sudah kami terima dan akan segera diproses.
      </p>

      <!-- Order info -->
      <div style="background:#09090b;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#71717a;">Nomor Pesanan</span>
          <span style="font-size:13px;font-weight:700;color:#3b82f6;letter-spacing:1px;">#${shortId}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:13px;color:#71717a;">Jumlah Item</span>
          <span style="font-size:13px;color:#fff;">${itemCount} item</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #27272a;">
          <span style="font-size:14px;font-weight:600;color:#fff;">Total Dibayar</span>
          <span style="font-size:16px;font-weight:700;color:#22c55e;">${formatPrice(totalAmount)}</span>
        </div>
      </div>

      <!-- Steps -->
      <div style="background:#09090b;border-radius:12px;padding:20px;margin-bottom:28px;text-align:left;">
        <p style="font-size:12px;color:#52525b;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Langkah Selanjutnya</p>
        <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
          <span style="font-size:16px;">📦</span>
          <div>
            <p style="font-size:13px;font-weight:600;color:#e4e4e7;margin:0 0 2px;">Pesanan Dikemas</p>
            <p style="font-size:12px;color:#71717a;margin:0;">Kami sedang menyiapkan game pilihanmu</p>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
          <span style="font-size:16px;">🚚</span>
          <div>
            <p style="font-size:13px;font-weight:600;color:#e4e4e7;margin:0 0 2px;">Pengiriman</p>
            <p style="font-size:12px;color:#71717a;margin:0;">Dikirim ke alamat yang kamu daftarkan</p>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <span style="font-size:16px;">🎮</span>
          <div>
            <p style="font-size:13px;font-weight:600;color:#e4e4e7;margin:0 0 2px;">Main Game!</p>
            <p style="font-size:12px;color:#71717a;margin:0;">Nikmati game fisik pilihanmu</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <a href="${appUrl}/orders/${orderId}"
        style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:10px;margin-bottom:16px;">
        Lacak Pesanan
      </a>
      <p style="font-size:12px;color:#52525b;margin:0;">
        Terima kasih sudah belanja di GameShelf! 🙏
      </p>
    </div>

    <p style="text-align:center;font-size:12px;color:#3f3f46;padding:24px 0;">
      © ${new Date().getFullYear()} GameShelf. Email ini dikirim otomatis, jangan dibalas.
    </p>
  </div>
</body>
</html>`
}

export async function sendOrderPaidEmail(data: PaidEmailData) {
  try {
    await resend.emails.send({
      from: 'GameShelf <onboarding@resend.dev>',
      to: data.userEmail,
      subject: `✅ Pembayaran Berhasil! Pesanan #${data.orderId.slice(0, 8).toUpperCase()} sedang diproses`,
      html: orderPaidTemplate(data),
    })
  } catch (err) {
    console.error('[Resend] Failed to send paid email:', err)
  }
}
