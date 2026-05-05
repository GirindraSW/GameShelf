// eslint-disable-next-line @typescript-eslint/no-require-imports
const MidtransClient = require('midtrans-client')

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

export const snap = new MidtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
}) as {
  createTransaction: (params: Record<string, unknown>) => Promise<{
    token: string
    redirect_url: string
  }>
}

export const SNAP_JS_URL = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'
