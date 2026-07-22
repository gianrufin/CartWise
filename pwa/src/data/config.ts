// Backend configuration. Phase 3 introduces an optional Supabase cloud
// backend; when the env vars below are present the app is intended to use
// Supabase Auth + Postgres, otherwise it runs on the local auth/store.
//
// The current implementation is local-only and fully functional offline
// (guest + local accounts). The Supabase adapter (auth + row-level-secure
// sync) is the remaining cloud wiring — see docs/backend/schema-plan.sql and
// pwa/.env.example. `isCloudConfigured` lets UI/logic branch once it lands.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// PayPal Subscriptions (Phase 8 payments). Client id + plan id are public and
// safe to ship in the browser; the secret lives only in the webhook function.
// When both are set the Subscription screen shows the real PayPal button
// instead of the dev demo toggle. See docs/PAYMENTS.md.
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "";
export const PAYPAL_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID ?? "";

export const isPaypalConfigured = Boolean(PAYPAL_CLIENT_ID && PAYPAL_PLAN_ID);
