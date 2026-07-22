# CartWise — Premium payments (PayPal)

Premium is sold via **PayPal Subscriptions**. The app renders a PayPal button
(public client id), the user approves in PayPal, and a **webhook** (Supabase Edge
Function, using your secret key) is the *only* thing that grants premium — so
entitlement can't be faked by the client.

```
App (PayPal button, client-id + plan-id)
   └─ user approves subscription (custom_id = Supabase user id)
        └─ PayPal → webhook (Edge Function, secret key)
              └─ verifies signature, sets users_profile.subscription_status = 'active'
                    └─ App reads status from users_profile → Premium unlocked
```

## 1. PayPal setup (sandbox first)

1. Create a PayPal **Developer** account → https://developer.paypal.com/.
2. **Apps & Credentials** (toggle **Sandbox**) → create an app → copy the
   **Client ID** and **Secret**.
3. Create a **subscription product + plan** (price, currency, interval). Easiest
   via the API with the helper script below, or the dashboard. Copy the **Plan
   ID** (`P-xxxxxxxx`).
4. **Webhooks** → add a webhook pointing at your Edge Function URL (step 3):
   `https://<project-ref>.functions.supabase.co/paypal-webhook`. Subscribe to:
   `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`,
   `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.SUSPENDED`,
   `PAYMENT.SALE.COMPLETED`. Copy the **Webhook ID**.

Create the plan via API (sandbox):

```bash
# get an access token
TOKEN=$(curl -s https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "$CLIENT_ID:$SECRET" -d grant_type=client_credentials | jq -r .access_token)

# product
PRODUCT=$(curl -s https://api-m.sandbox.paypal.com/v1/catalogs/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"CartWise Premium","type":"SERVICE"}' | jq -r .id)

# monthly plan (edit price/currency)
curl -s https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"product_id\":\"$PRODUCT\",\"name\":\"Premium Monthly\",
       \"billing_cycles\":[{\"frequency\":{\"interval_unit\":\"MONTH\",\"interval_count\":1},
       \"tenure_type\":\"REGULAR\",\"sequence\":1,\"total_cycles\":0,
       \"pricing_scheme\":{\"fixed_price\":{\"value\":\"149\",\"currency_code\":\"PHP\"}}}],
       \"payment_preferences\":{\"auto_bill_outstanding\":true}}" | jq -r .id
```

## 2. Deploy the webhook Edge Function

The function lives at `supabase/functions/paypal-webhook/`. Deploy with the
Supabase CLI and set its secrets (never commit these):

```bash
supabase functions deploy paypal-webhook --no-verify-jwt   # PayPal calls it unauthenticated
supabase secrets set \
  PAYPAL_ENV=sandbox \
  PAYPAL_CLIENT_ID=... \
  PAYPAL_SECRET=... \
  PAYPAL_WEBHOOK_ID=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically for
Edge Functions.

## 3. Lock down entitlement (go-live)

Apply `supabase/migrations/0005_billing_lockdown.sql`. It stops the client from
writing its own `subscription_status` — only the webhook (service role) can.
**Apply this only once real billing is wired**, because it disables the demo
upgrade toggle used during development.

## 4. Point the PWA at PayPal

Add to `pwa/.env.local` (client id + plan id are public and safe in the client):

```
VITE_PAYPAL_CLIENT_ID=...
VITE_PAYPAL_PLAN_ID=P-xxxxxxxx
```

With those set, the Subscription screen shows the real PayPal button instead of
the demo toggle. After approval the app polls `users_profile.subscription_status`
until the webhook flips it to `active`.

## 5. Verify (sandbox)

- Use a PayPal **sandbox buyer** account to subscribe.
- Watch the Edge Function logs (`supabase functions logs paypal-webhook`).
- Confirm `users_profile.subscription_status` becomes `active` and the app
  unlocks premium.
- Cancel in PayPal → webhook sets `cancelled` → premium locks on next load.

## Going live

Swap `PAYPAL_ENV=live`, use live Client ID/Secret/Plan/Webhook, and live
`VITE_PAYPAL_CLIENT_ID` / `VITE_PAYPAL_PLAN_ID`. PayPal must approve the app for
live subscriptions first.
