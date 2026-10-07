# HelzerX payment automation

This service is intentionally separate from the CMS/Auth API on port 3000. It handles only payment automation, Discord order tickets and Pterodactyl provisioning.

## Production flow

1. The frontend requests the current plan price from `/api/payments/payhere/quote`.
2. The server creates a pending order from the CMS plan definition and creates a private Discord order ticket.
3. The server generates the PayHere hash; the merchant secret never reaches the browser.
4. The customer is redirected to PayHere.
5. PayHere calls `/api/payments/payhere/notify` server-to-server.
6. The notification is verified with the PayHere MD5 checksum and the stored amount/currency before payment becomes `paid`.
7. The Discord ticket is updated. Staff can press **Payment Done** only after the verified payment state is `paid`.
8. The bot creates the Pterodactyl user/server once. Repeated button clicks cannot double-provision the order.
9. The ticket receives the provisioning result and the customer is DM'd when a Discord user ID is linked to the order.

The browser return page is never treated as proof of payment.

## Required production configuration

Copy `.env.automation.example` to `.env.automation` and fill the real values. Do not commit `.env.automation`.

PayHere requires a Merchant ID and a Merchant Secret for the exact integrating domain. The public notify URL must be reachable from PayHere.

Discord requires a bot token and a valid **category** ID for ticket creation. The bot needs permission to view the guild, manage channels, send messages and manage permissions. A staff role ID is recommended.

Pterodactyl requires an Application API token with permission to create users and servers. Set a real allocation ID or change the provisioning policy to use a deployment allocation strategy appropriate for the node.

## Nginx

Include `deploy/nginx-arvex-automation.conf` inside the HTTPS `helzerx.cyou` server block, before a generic `/api/` proxy that points at port 5000. Then test and reload Nginx.

## systemd

Install `deploy/arvex-automation.service` as `/etc/systemd/system/arvex-automation.service`, then enable and start it. The service is deliberately separate from `arvex-api.service` so a failure in payment automation cannot take down authentication/CMS.

## Important safety rule

Never mark an order paid from the browser, Discord button alone, or return URL. Only a verified PayHere server notification changes `paymentStatus` to `paid`.
