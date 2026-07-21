-- CartWise — initial cloud schema (Phase 3)
--
-- Runnable Supabase/PostgreSQL migration for the MVP subset of
-- docs/backend/schema-plan.sql: profiles, lists, items, trips, payments, and
-- subscriptions. Every table has Row Level Security ON with owner-scoped
-- policies, so private data is enforced by the database, not the UI
-- (a core product rule). Sharing/collaboration policies arrive in Phase 4–5.
--
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

-- ============================================================ profiles
-- One row per auth user. Auto-created by a trigger on auth.users insert.
create table if not exists public.users_profile (
  id                  uuid primary key references auth.users (id) on delete cascade,
  display_name        text not null default '',
  email               text not null default '',
  avatar_url          text,
  default_currency    text not null default 'PHP',
  subscription_status text not null default 'free'
    check (subscription_status in ('free','trialing','active','past_due','cancelled','expired')),
  subscription_plan   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

alter table public.users_profile enable row level security;

create policy "profiles are self-readable"
  on public.users_profile for select using (auth.uid() = id);
create policy "profiles are self-updatable"
  on public.users_profile for update using (auth.uid() = id);
create policy "profiles are self-insertable"
  on public.users_profile for insert with check (auth.uid() = id);

-- Create the profile row automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users_profile (id, email, display_name, default_currency)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'default_currency', 'PHP')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================ shopping_lists
create table if not exists public.shopping_lists (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users_profile (id) on delete cascade,
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

alter table public.shopping_lists enable row level security;

-- Owner-only for now. Phase 4 adds membership-based read/write via list_members.
create policy "lists are owner-accessible"
  on public.shopping_lists for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create index if not exists shopping_lists_owner_idx
  on public.shopping_lists (owner_user_id);

-- ============================================================ list_items
create table if not exists public.list_items (
  id                    uuid primary key default gen_random_uuid(),
  list_id               uuid not null references public.shopping_lists (id) on delete cascade,
  name                  text not null,
  notes                 text,
  quantity              numeric(10,3) not null default 1,
  unit                  text,
  estimated_unit_price  numeric(12,2),
  estimated_total_price numeric(12,2),
  actual_unit_price     numeric(12,2),
  actual_total_price    numeric(12,2),
  category              text,
  store                 text,
  priority              text not null default 'normal'
    check (priority in ('essential','normal','optional')),
  status                text not null default 'pending'
    check (status in ('pending','requested','approved','in_cart','purchased',
                      'unavailable','skipped','replaced','carried_over','removed')),
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  resolved_at           timestamptz
);

alter table public.list_items enable row level security;

-- Items are reachable only through a list the caller owns.
create policy "items follow their list"
  on public.list_items for all
  using (
    exists (
      select 1 from public.shopping_lists l
      where l.id = list_items.list_id and l.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shopping_lists l
      where l.id = list_items.list_id and l.owner_user_id = auth.uid()
    )
  );

create index if not exists list_items_list_idx on public.list_items (list_id);

-- ============================================================ shopping_trips
create table if not exists public.shopping_trips (
  id                  uuid primary key default gen_random_uuid(),
  list_id             uuid references public.shopping_lists (id) on delete set null,
  owner_user_id       uuid not null references public.users_profile (id) on delete cascade,
  list_name           text not null,
  status              text not null default 'completed'
    check (status in ('active','completed','reopened','cancelled')),
  budget_amount       numeric(12,2),
  actual_total_amount numeric(12,2) not null default 0,
  currency            text not null default 'PHP',
  purchased_count     integer not null default 0,
  unavailable_count   integer not null default 0,
  skipped_count       integer not null default 0,
  carried_over_count  integer not null default 0,
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.shopping_trips enable row level security;

create policy "trips are owner-accessible"
  on public.shopping_trips for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create index if not exists shopping_trips_owner_idx
  on public.shopping_trips (owner_user_id);

-- ============================================================ trip_payments
-- Payment METHOD + amount only. Never card numbers or credentials.
create table if not exists public.trip_payments (
  id             uuid primary key default gen_random_uuid(),
  trip_id        uuid not null references public.shopping_trips (id) on delete cascade,
  payment_method text not null
    check (payment_method in ('cash','gcash','maya','debit_card','credit_card',
                              'bank_transfer','voucher','other')),
  amount         numeric(12,2) not null,
  notes          text,
  created_at     timestamptz not null default now()
);

alter table public.trip_payments enable row level security;

create policy "payments follow their trip"
  on public.trip_payments for all
  using (
    exists (
      select 1 from public.shopping_trips t
      where t.id = trip_payments.trip_id and t.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.shopping_trips t
      where t.id = trip_payments.trip_id and t.owner_user_id = auth.uid()
    )
  );

-- ============================================================ subscriptions
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.users_profile (id) on delete cascade,
  provider                 text not null default 'google_play'
    check (provider in ('google_play','web_payment_provider_later')),
  provider_customer_id     text,
  provider_subscription_id text,
  plan                     text not null default 'free',
  status                   text not null default 'free'
    check (status in ('free','trialing','active','past_due','cancelled','expired')),
  started_at               timestamptz,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancelled_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions are self-accessible"
  on public.subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================ updated_at touch
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'users_profile','shopping_lists','list_items','shopping_trips','subscriptions'
  ]
  loop
    execute format(
      'drop trigger if exists touch_%1$s on public.%1$s;
       create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;
