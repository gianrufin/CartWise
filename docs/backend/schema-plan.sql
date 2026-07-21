-- CartWise — Supabase / PostgreSQL schema plan (Phase 0 planning file)
--
-- NOT executed yet. This file documents the intended relational model so that
-- Phase 1 local models (Room / IndexedDB) and Phase 3 cloud tables stay aligned.
-- Row Level Security policies are sketched as comments; they are implemented in
-- Phase 3 (auth) and hardened in Phase 5 (permissions & privacy).
--
-- Conventions: uuid PKs, timestamptz audit columns, soft-delete via status or
-- *_at columns, snake_case, enums as CHECK constraints for portability.

-- ============================================================ users_profile
-- Mirrors auth.users (Supabase Auth). One row per registered account.
create table users_profile (
  id                  uuid primary key,            -- = auth.users.id
  display_name        text not null,
  email               text not null,
  avatar_url          text,
  default_currency    text not null default 'PHP',
  subscription_status text not null default 'free'
    check (subscription_status in ('free','trialing','active','past_due','cancelled','expired')),
  subscription_plan   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
-- RLS: user can select/update own row only.

-- ============================================================ households
create table households (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  owner_user_id    uuid not null references users_profile(id),
  default_currency text not null default 'PHP',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  archived_at      timestamptz
);

-- ============================================================ household_members
create table household_members (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null references households(id),
  user_id            uuid not null references users_profile(id),
  role               text not null default 'contributor'
    check (role in ('owner','manager','shopper','contributor','request_only','viewer')),
  status             text not null default 'active',
  joined_at          timestamptz,
  invited_by_user_id uuid references users_profile(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (household_id, user_id)
);

-- ============================================================ invitations
create table invitations (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid references households(id),
  list_id            uuid,                          -- fk added after shopping_lists
  invited_email      text,
  invite_token       text not null unique,
  invited_by_user_id uuid not null references users_profile(id),
  role               text not null default 'contributor',
  status             text not null default 'pending'
    check (status in ('pending','accepted','revoked','expired')),
  expires_at         timestamptz not null,
  used_at            timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
-- Rules: links expire and are revocable; shared contents are hidden until the
-- invited user signs in / creates an account.

-- ============================================================ shopping_lists
create table shopping_lists (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users_profile(id),
  household_id  uuid references households(id),
  name          text not null,
  description   text,
  currency      text not null default 'PHP',
  budget_amount numeric(12,2),
  visibility    text not null default 'private'
    check (visibility in ('private','shared_selected','shared_household','invite_only')),
  status        text not null default 'active'
    check (status in ('active','archived','deleted')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  archived_at   timestamptz
);
-- RLS: owner always; members via list_members when visibility != 'private'.
-- Private lists must be invisible to everyone but the owner — enforced here,
-- never only in the UI.

alter table invitations
  add constraint invitations_list_fk foreign key (list_id) references shopping_lists(id);

-- ============================================================ list_members
-- Role-based for MVP; granular can_* toggles land in Phase 5.
create table list_members (
  id                 uuid primary key default gen_random_uuid(),
  list_id            uuid not null references shopping_lists(id),
  user_id            uuid not null references users_profile(id),
  role               text not null default 'contributor'
    check (role in ('owner','shopper','contributor','request_only','viewer')),
  can_view_items     boolean not null default true,
  can_add_items      boolean not null default false,
  can_edit_items     boolean not null default false,
  can_delete_items   boolean not null default false,
  can_enter_prices   boolean not null default false,
  can_mark_purchased boolean not null default false,
  can_change_budget  boolean not null default false,
  can_invite_members boolean not null default false,
  can_complete_trip  boolean not null default false,
  can_view_spending  boolean not null default false,
  can_export         boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (list_id, user_id)
);

-- ============================================================ stores
create table stores (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid references shopping_lists(id),
  trip_id    uuid,                                  -- fk added after shopping_trips
  name       text not null,                         -- e.g. SM Supermarket, Wet Market
  address    text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================ categories
-- Defaults seeded per user: Produce, Meat and Seafood, Dairy, Pantry, Snacks,
-- Beverages, Household, Personal Care, Baby and Kids, Pets, Pharmacy, Other.
create table categories (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users_profile(id),
  household_id  uuid references households(id),
  name          text not null,
  icon          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================ list_items
create table list_items (
  id                     uuid primary key default gen_random_uuid(),
  list_id                uuid not null references shopping_lists(id),
  name                   text not null,
  notes                  text,
  quantity               numeric(10,3) not null default 1,
  unit                   text,                      -- kg, pc, tray, pack, L, ...
  estimated_unit_price   numeric(12,2),
  estimated_total_price  numeric(12,2),
  actual_unit_price      numeric(12,2),
  actual_total_price     numeric(12,2),
  category_id            uuid references categories(id),
  store_id               uuid references stores(id),
  priority               text not null default 'normal'
    check (priority in ('essential','normal','optional')),
  status                 text not null default 'pending'
    check (status in ('pending','requested','approved','in_cart','purchased',
                      'unavailable','skipped','replaced','carried_over','removed')),
  requested_by_user_id   uuid references users_profile(id),
  approved_by_user_id    uuid references users_profile(id),
  purchased_by_user_id   uuid references users_profile(id),
  photo_url              text,
  substitute_for_item_id uuid references list_items(id),
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  resolved_at            timestamptz
);
-- Only status = 'purchased' rows count toward actual spending.

-- ============================================================ item_requests
create table item_requests (
  id                   uuid primary key default gen_random_uuid(),
  list_id              uuid not null references shopping_lists(id),
  requested_by_user_id uuid not null references users_profile(id),
  name                 text not null,
  notes                text,
  quantity             numeric(10,3) not null default 1,
  estimated_price      numeric(12,2),
  status               text not null default 'pending'
    check (status in ('pending','approved','declined','edited','cancelled')),
  reviewed_by_user_id  uuid references users_profile(id),
  review_note          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================ shopping_trips
create table shopping_trips (
  id                   uuid primary key default gen_random_uuid(),
  list_id              uuid not null references shopping_lists(id),
  owner_user_id        uuid not null references users_profile(id),
  started_by_user_id   uuid not null references users_profile(id),
  completed_by_user_id uuid references users_profile(id),
  status               text not null default 'active'
    check (status in ('active','completed','reopened','cancelled')),
  budget_amount        numeric(12,2),
  actual_total_amount  numeric(12,2) not null default 0,
  currency             text not null default 'PHP',
  started_at           timestamptz not null default now(),
  completed_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
-- Completed trips are read-only unless reopened by an allowed user.

alter table stores
  add constraint stores_trip_fk foreign key (trip_id) references shopping_trips(id);

-- ============================================================ trip_payments
-- Payment METHOD + amount only. Never card numbers, bank details, credentials.
create table trip_payments (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references shopping_trips(id),
  payment_method text not null
    check (payment_method in ('cash','gcash','maya','debit_card','credit_card',
                              'bank_transfer','voucher','other')),
  amount         numeric(12,2) not null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================ subscriptions
create table subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references users_profile(id),
  provider                 text not null
    check (provider in ('google_play','web_payment_provider_later')),
  provider_customer_id     text,
  provider_subscription_id text,
  plan                     text not null,
  status                   text not null
    check (status in ('free','trialing','active','past_due','cancelled','expired')),
  started_at               timestamptz,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancelled_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ============================================================ later tables
-- item_price_history         (Phase 12) — normalized names, store-level prices
-- item_photos                (Phase 11) — one compressed photo per item
-- activity_log               — lightweight collaboration feed + offline debugging
-- notification_preferences   — per-user notification settings
-- export_jobs                (Phase 9) — premium CSV/PDF export tracking
