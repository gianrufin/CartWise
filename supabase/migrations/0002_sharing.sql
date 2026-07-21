-- CartWise — sharing & collaboration (Phase 4)
--
-- Adds list membership + invitations, role-based Row Level Security so members
-- can access a shared list according to their role, an accept-invitation RPC,
-- and the Realtime publication for live updates.
--
-- Roles (MVP): owner, shopper, contributor, viewer.
--   viewer      → read only
--   contributor → read + add/edit items
--   shopper     → read + add/edit items + prices + status + complete trips
--   owner       → everything incl. members, budget, delete
--
-- Apply after 0001. Idempotent where practical.

-- ============================================================ list_members
create table if not exists public.list_members (
  id           uuid primary key default gen_random_uuid(),
  list_id      uuid not null references public.shopping_lists (id) on delete cascade,
  user_id      uuid not null references public.users_profile (id) on delete cascade,
  role         text not null default 'contributor'
    check (role in ('owner','shopper','contributor','viewer')),
  -- Denormalised so co-members can display each other without reading the
  -- (self-only) users_profile table. Populated by accept_invitation().
  display_name text,
  email        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (list_id, user_id)
);
create index if not exists list_members_list_idx on public.list_members (list_id);
create index if not exists list_members_user_idx on public.list_members (user_id);
alter table public.list_members enable row level security;

-- ============================================================ invitations
create table if not exists public.invitations (
  id                 uuid primary key default gen_random_uuid(),
  list_id            uuid not null references public.shopping_lists (id) on delete cascade,
  invited_email      text,
  invite_token       text not null unique,
  invited_by_user_id uuid not null references public.users_profile (id) on delete cascade,
  role               text not null default 'contributor'
    check (role in ('shopper','contributor','viewer')),
  status             text not null default 'pending'
    check (status in ('pending','accepted','revoked','expired')),
  expires_at         timestamptz not null default (now() + interval '14 days'),
  used_at            timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists invitations_list_idx on public.invitations (list_id);
alter table public.invitations enable row level security;

-- =================================================== SECURITY DEFINER helpers
-- These bypass RLS internally so membership policies don't recurse.
create or replace function public.is_list_owner(p_list uuid, p_uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from shopping_lists l where l.id = p_list and l.owner_user_id = p_uid
  );
$$;

create or replace function public.is_list_member(p_list uuid, p_uid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_list_owner(p_list, p_uid)
      or exists (select 1 from list_members m where m.list_id = p_list and m.user_id = p_uid);
$$;

create or replace function public.list_member_role(p_list uuid, p_uid uuid)
returns text language sql security definer stable set search_path = public as $$
  select case
    when public.is_list_owner(p_list, p_uid) then 'owner'
    else (select role from list_members m where m.list_id = p_list and m.user_id = p_uid limit 1)
  end;
$$;

-- =================================================== shopping_lists policies
-- Replace the owner-only policy from 0001 with member-aware access.
drop policy if exists "lists are owner-accessible" on public.shopping_lists;

create policy "lists: members read"
  on public.shopping_lists for select
  using (public.is_list_member(id, auth.uid()));
create policy "lists: owner insert"
  on public.shopping_lists for insert
  with check (owner_user_id = auth.uid());
create policy "lists: owner update"
  on public.shopping_lists for update
  using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy "lists: owner delete"
  on public.shopping_lists for delete
  using (owner_user_id = auth.uid());

-- =================================================== list_items policies
drop policy if exists "items follow their list" on public.list_items;

create policy "items: members read"
  on public.list_items for select
  using (public.is_list_member(list_id, auth.uid()));
create policy "items: editors write"
  on public.list_items for insert
  with check (public.list_member_role(list_id, auth.uid()) in ('owner','shopper','contributor'));
create policy "items: editors update"
  on public.list_items for update
  using (public.list_member_role(list_id, auth.uid()) in ('owner','shopper','contributor'))
  with check (public.list_member_role(list_id, auth.uid()) in ('owner','shopper','contributor'));
create policy "items: editors delete"
  on public.list_items for delete
  using (public.list_member_role(list_id, auth.uid()) in ('owner','shopper','contributor'));

-- =================================================== list_members policies
create policy "members: co-members read"
  on public.list_members for select
  using (public.is_list_member(list_id, auth.uid()));
create policy "members: owner manages"
  on public.list_members for all
  using (public.is_list_owner(list_id, auth.uid()))
  with check (public.is_list_owner(list_id, auth.uid()));

-- =================================================== invitations policies
create policy "invites: owner or invitee reads"
  on public.invitations for select
  using (invited_by_user_id = auth.uid()
      or lower(coalesce(invited_email, '')) = lower(coalesce(auth.email(), '')));
create policy "invites: owner creates"
  on public.invitations for insert
  with check (public.is_list_owner(list_id, auth.uid()) and invited_by_user_id = auth.uid());
create policy "invites: owner updates"
  on public.invitations for update
  using (public.is_list_owner(list_id, auth.uid()));

-- =================================================== accept_invitation RPC
-- Lets an invited user join a list without the owner-only insert policy on
-- list_members blocking them. Validates the token + (optional) email match.
create or replace function public.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv record;
begin
  select * into inv from invitations
    where invite_token = p_token and status = 'pending' and expires_at > now();
  if inv is null then
    raise exception 'This invite link is invalid or has expired.';
  end if;
  if inv.invited_email is not null
     and lower(inv.invited_email) <> lower(coalesce(auth.email(), '')) then
    raise exception 'This invite is for a different email address.';
  end if;

  insert into list_members (list_id, user_id, role, display_name, email)
    select inv.list_id, auth.uid(), inv.role, p.display_name, p.email
      from users_profile p where p.id = auth.uid()
    on conflict (list_id, user_id) do update set role = excluded.role, updated_at = now();
  update invitations set status = 'accepted', used_at = now() where id = inv.id;
  return inv.list_id;
end $$;

-- =================================================== updated_at touch
drop trigger if exists touch_list_members on public.list_members;
create trigger touch_list_members before update on public.list_members
  for each row execute function public.touch_updated_at();

-- =================================================== Realtime
-- Broadcast row changes for live collaboration. (Safe to re-run.)
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.shopping_lists'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.list_items'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.list_members'; exception when duplicate_object then null; end;
end $$;
