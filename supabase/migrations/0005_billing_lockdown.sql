-- CartWise — billing entitlement lockdown (Phase 8 / payments)
--
-- Makes subscription_status server-authoritative: only the PayPal webhook
-- (which uses the service role) may change it. Client updates to that column
-- are silently ignored, so a user can't grant themselves premium.
--
-- APPLY ONLY WHEN REAL BILLING IS WIRED — it disables the dev demo-upgrade
-- toggle (which sets subscription_status from the client). See docs/PAYMENTS.md.

create or replace function public.guard_subscription_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Anyone but the service role (the webhook) can't change subscription_status.
  if new.subscription_status is distinct from old.subscription_status
     and coalesce(auth.role(), '') <> 'service_role' then
    new.subscription_status := old.subscription_status;
  end if;
  return new;
end $$;

drop trigger if exists guard_subscription on public.users_profile;
create trigger guard_subscription
  before update on public.users_profile
  for each row execute function public.guard_subscription_status();

-- Needed for the webhook's upsert(onConflict: provider_subscription_id).
create unique index if not exists subscriptions_provider_sub_idx
  on public.subscriptions (provider_subscription_id);
