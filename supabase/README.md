# CartWise — Supabase backend

Cloud backend for CartWise (Phase 3+). The app runs fully locally without this;
configuring Supabase turns on accounts-in-the-cloud, cross-device sync, and
database-enforced privacy.

## What's here

- `migrations/0001_initial_schema.sql` — MVP tables (profiles, lists, items,
  trips, payments, subscriptions), **Row Level Security** with owner-scoped
  policies, an auto-profile trigger on signup, and `updated_at` touch triggers.

The full field-level plan (including later tables) lives in
[`../docs/backend/schema-plan.sql`](../docs/backend/schema-plan.sql).

## Apply the migration

**Option A — Supabase CLI**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — SQL editor**

Open the Supabase dashboard → SQL editor → paste
`migrations/0001_initial_schema.sql` → Run.

## Point the PWA at it

Copy `pwa/.env.example` to `pwa/.env.local` and fill in:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

With those set, `isCloudConfigured` becomes true and the cloud client
(`pwa/src/data/cloud/`) is available. The anon key is a public client key, but
keep it out of version control.

## Security model

- RLS is **on** for every table; the anon key alone can't read another user's
  rows. Access is scoped to `auth.uid()`.
- Private lists are invisible to non-owners at the database level.
- `trip_payments` stores payment **method + amount only** — never card numbers
  or credentials.
- Phase 4 adds `list_members` + membership-based policies for shared lists;
  Phase 5 hardens per-action permissions.
