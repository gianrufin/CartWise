-- CartWise — item requests + photos (Phases 10 & 11)
--
-- Builds on 0002/0003. Adds the request-only role, an item_requests table with
-- RLS, and a private storage bucket for item photos scoped to list membership.
-- Apply after 0003. Idempotent where practical.

-- ============================================ request_only role
alter table public.list_members drop constraint if exists list_members_role_check;
alter table public.list_members
  add constraint list_members_role_check
  check (role in ('owner','shopper','contributor','viewer','request_only'));

alter table public.invitations drop constraint if exists invitations_role_check;
alter table public.invitations
  add constraint invitations_role_check
  check (role in ('shopper','contributor','viewer','request_only'));

-- ============================================ item_requests (Phase 10)
create table if not exists public.item_requests (
  id                   uuid primary key default gen_random_uuid(),
  list_id              uuid not null references public.shopping_lists (id) on delete cascade,
  requested_by_user_id uuid not null references public.users_profile (id) on delete cascade,
  requested_by_name    text,
  name                 text not null,
  notes                text,
  quantity             numeric(10,3) not null default 1,
  estimated_price      numeric(12,2),
  status               text not null default 'pending'
    check (status in ('pending','approved','declined','edited','cancelled')),
  reviewed_by_user_id  uuid references public.users_profile (id),
  review_note          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists item_requests_list_idx on public.item_requests (list_id);
alter table public.item_requests enable row level security;

-- Any member can see a list's requests; members submit their own; owner reviews.
create policy "requests: members read"
  on public.item_requests for select
  using (public.is_list_member(list_id, auth.uid()));
create policy "requests: members create own"
  on public.item_requests for insert
  with check (public.is_list_member(list_id, auth.uid()) and requested_by_user_id = auth.uid());
create policy "requests: requester or owner update"
  on public.item_requests for update
  using (public.is_list_owner(list_id, auth.uid()) or requested_by_user_id = auth.uid());

drop trigger if exists touch_item_requests on public.item_requests;
create trigger touch_item_requests before update on public.item_requests
  for each row execute function public.touch_updated_at();

-- item_requests changes are also useful live.
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.item_requests'; exception when duplicate_object then null; end;
end $$;

-- ============================================ item photos storage (Phase 11)
-- Private bucket; objects are keyed by "<list_id>/<item_id>...", so access is
-- scoped to list membership just like the rows.
insert into storage.buckets (id, name, public)
  values ('item-photos', 'item-photos', false)
  on conflict (id) do nothing;

drop policy if exists "item photos read" on storage.objects;
create policy "item photos read" on storage.objects for select
  using (
    bucket_id = 'item-photos'
    and public.is_list_member(((storage.foldername(name))[1])::uuid, auth.uid())
  );

drop policy if exists "item photos write" on storage.objects;
create policy "item photos write" on storage.objects for insert
  with check (
    bucket_id = 'item-photos'
    and public.list_member_role(((storage.foldername(name))[1])::uuid, auth.uid())
        in ('owner','shopper','contributor')
  );

drop policy if exists "item photos update" on storage.objects;
create policy "item photos update" on storage.objects for update
  using (
    bucket_id = 'item-photos'
    and public.list_member_role(((storage.foldername(name))[1])::uuid, auth.uid())
        in ('owner','shopper','contributor')
  );

drop policy if exists "item photos delete" on storage.objects;
create policy "item photos delete" on storage.objects for delete
  using (
    bucket_id = 'item-photos'
    and public.list_member_role(((storage.foldername(name))[1])::uuid, auth.uid())
        in ('owner','shopper','contributor')
  );
