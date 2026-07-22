-- CartWise — permissions & privacy (Phase 5)
--
-- Builds on 0002. Adds a per-collaborator "can view spending" permission and
-- keeps each list's visibility (private vs shared) in step with its membership
-- automatically, at the database level.
--
-- Apply after 0002. Idempotent where practical.

-- ============================================ per-member spending permission
alter table public.list_members
  add column if not exists can_view_spending boolean not null default true;

-- ============================================ auto-maintained list visibility
-- A list is 'private' with no members and 'shared_selected' once it has any.
-- Runs as SECURITY DEFINER so the membership change (made by the owner) can
-- update the list row regardless of who triggered it.
create or replace function public.sync_list_visibility()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target uuid := coalesce(new.list_id, old.list_id);
  n integer;
begin
  select count(*) into n from list_members where list_id = target;
  update shopping_lists
     set visibility = case when n > 0 then 'shared_selected' else 'private' end,
         updated_at = now()
   where id = target
     and visibility <> case when n > 0 then 'shared_selected' else 'private' end;
  return null;
end $$;

drop trigger if exists list_members_visibility on public.list_members;
create trigger list_members_visibility
  after insert or delete on public.list_members
  for each row execute function public.sync_list_visibility();

-- Backfill visibility for any lists that already have members.
update public.shopping_lists l
   set visibility = 'shared_selected'
 where visibility = 'private'
   and exists (select 1 from public.list_members m where m.list_id = l.id);
