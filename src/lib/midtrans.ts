// eslint-disable-next-line @typescript-eslint/no-require-imports
const MidtransClient = require('midtrans-client')

const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

const config = {
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
}

export const snap = new MidtransClient.Snap(config) as {
  createTransaction: (params: Record<string, unknown>) => Promise<{
    token: string
    redirect_url: string
  }>
}

export const coreApi = new MidtransClient.CoreApi(config) as {
  transaction: {
    status: (orderId: string) => Promise<{
      transaction_status: string
      fraud_status: string
      status_code: string
      order_id: string
    }>
  }
}

export const SNAP_JS_URL = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'
