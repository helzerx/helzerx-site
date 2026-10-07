# ArveX PayHere deployment

The repository contains a server-side PayHere automation service so the PayHere Merchant Secret never reaches the Vite bundle.

## Environment

Add these values to the server environment:

```env
PAYHERE_MERCHANT_ID=YOUR_MERCHANT_ID
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET
PAYHERE_SANDBOX=true
AUTOMATION_PORT=5001
INTERNAL_API_ORIGIN=http://127.0.0.1:3000
PAYHERE_USD_TO_LKR=300
```

Keep `PAYHERE_MERCHANT_SECRET` server-only.

The active public origin must be supplied through `PUBLIC_ORIGIN`; do not hard-code a domain in the deployment scripts.

## Health checks

```bash
curl -fsS http://127.0.0.1:5001/api/payments/payhere/status?orderId=TEST
```

A real order should only become paid after a verified PayHere server notification. The browser return URL is never treated as proof of payment.
