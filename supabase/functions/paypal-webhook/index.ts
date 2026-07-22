// CartWise — PayPal subscription webhook (Supabase Edge Function, Deno).
//
// PayPal calls this on subscription lifecycle events. It VERIFIES the webhook
// signature with PayPal (so requests can't be spoofed), maps the subscription's
// custom_id (= Supabase user id) to the account, and updates
// users_profile.subscription_status using the service role. This is the ONLY
// place premium is granted — the client can't set it (see 0005 migration).
//
// Deploy:  supabase functions deploy paypal-webhook --no-verify-jwt
// Secrets: PAYPAL_ENV, PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_WEBHOOK_ID
//          (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") ?? "sandbox";
const PAYPAL_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const SECRET = Deno.env.get("PAYPAL_SECRET")!;
const WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function paypalToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  return json.access_token;
}

// Ask PayPal to confirm the webhook signature is authentic.
async function verifySignature(
  headers: Headers,
  body: unknown,
  token: string
): Promise<boolean> {
  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: WEBHOOK_ID,
      webhook_event: body,
    }),
  });
  const json = await res.json();
  return json.verification_status === "SUCCESS";
}

// Map a PayPal event type to our subscription_status.
function statusFor(eventType: string): string | null {
  switch (eventType) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "PAYMENT.SALE.COMPLETED":
      return "active";
    case "BILLING.SUBSCRIPTION.CANCELLED":
      return "cancelled";
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      return "past_due";
    case "BILLING.SUBSCRIPTION.EXPIRED":
      return "expired";
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const raw = await req.text();
  const event = JSON.parse(raw);

  const token = await paypalToken();
  const ok = await verifySignature(req.headers, event, token);
  if (!ok) return new Response("Invalid signature", { status: 400 });

  const status = statusFor(event.event_type);
  if (!status) return new Response("Ignored", { status: 200 });

  // custom_id is set to the Supabase user id when the subscription is created.
  const resource = event.resource ?? {};
  const userId: string | undefined = resource.custom_id;
  const subscriptionId: string | undefined = resource.id ?? resource.billing_agreement_id;
  if (!userId) return new Response("No custom_id", { status: 200 });

  await supabase.from("users_profile").update({ subscription_status: status }).eq("id", userId);
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      provider: "web_payment_provider_later",
      provider_subscription_id: subscriptionId,
      plan: "premium",
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_subscription_id" }
  );

  return new Response("ok", { status: 200 });
});
