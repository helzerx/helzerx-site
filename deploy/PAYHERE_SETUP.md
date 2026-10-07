# HelzerX PayHere deployment

The repository now contains a separate server-side PayHere service so the PayHere Merchant Secret never reaches the Vite bundle.

## 1. Environment

Add these values to `/var/www/helzerx/.env`:

```env
PAYHERE_MERCHANT_ID=YOUR_MERCHANT_ID
PAYHERE_MERCHANT_SECRET=YOUR_MERCHANT_SECRET
PAYHERE_SANDBOX=true
AUTOMATION_PORT=5001
INTERNAL_API_ORIGIN=http://127.0.0.1:3000
PAYHERE_USD_TO_LKR=300
```

Keep `PAYHERE_MERCHANT_SECRET` server-only.

## 2. Install the service

```bash
cd /var/www/arvex
git pull origin main
cp deploy/helzerx-automation.service /etc/systemd/system/arvex-payments.service
systemctl daemon-reload
systemctl enable --now arvex-payments
systemctl status arvex-payments --no-pager
```

## 3. Nginx

Inside the existing HTTPS `server {}` block for `helzerx.cyou`, add the location from `deploy/nginx-payhere-location.conf` **before** the generic `/api/` location.

Then:

```bash
nginx -t && systemctl reload nginx
```

## 4. Health checks

```bash
curl -fsS http://127.0.0.1:5001/api/payments/health
curl -fsS https://arvex.host/api/payments/health
```

The response should report `ok: true`. `payhereConfigured` becomes `true` after the Merchant ID and Merchant Secret are configured.

## 5. PayHere domain

In PayHere Integrations, add/approve `arvex.host` and use the Merchant Secret generated for that domain. PayHere requires the merchant secret to remain server-side and requires the payment notification signature to be verified before treating a payment as successful.

## 6. Production switch

After a successful sandbox payment test, set:

```env
PAYHERE_SANDBOX=false
```

Then restart only the payment service:

```bash
systemctl restart arvex-payments
```

Do not mark an order paid from the browser return URL. The implementation only changes the order to `paid` after a verified PayHere server notification with a matching merchant ID, order ID, currency, amount and `md5sig`.
