# CartWise

**Plan together, shop live, and stay within budget.**

CartWise is an Android-first grocery planning, live shopping, and household spending
tracker. Users create grocery lists, set budgets, add item prices, shop with a live
running total, and collaborate with other people in real time. Initial launch market
is the Philippines (PHP-first, multi-currency capable).

This repository contains:

| Path | What it is |
| --- | --- |
| `android/` | Native Android app — Kotlin, Jetpack Compose, Material 3 |
| `pwa/` | Full-featured PWA — React + Vite + TypeScript, installable, offline-ready shell |
| `docs/` | Product blueprint, backend (Supabase) schema plan, shared design tokens |

## Current status — Phase 1: Local Guest Mode MVP (PWA)

Foundations (Phase 0) plus a working local-only guest app in the PWA, per the
build plan in [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md):

- ✅ Android project (Kotlin + Jetpack Compose + Material 3) with navigation
- ✅ PWA project (React + Vite + TS) with responsive mobile-first layout
- ✅ Shared design tokens (`docs/design-tokens.md`, mirrored in both apps)
- ✅ Dark **glassmorphism** design system (deep indigo, frosted glass cards,
  gradient accents, glowing center nav button), minimal line icons, Inter 300 body
- ✅ **Quick Tally** — a persistent price calculator that stacks grocery
  amounts into a live running total (item names optional; persists across reloads)
- ✅ **Phase 1 (PWA):** local persistent store (localStorage) with full guest
  workflow — create/edit/delete lists, add/edit/delete items, budgets &
  currency, estimated/actual prices with unit↔total calc + mismatch warning,
  live shopping mode, end-of-trip unresolved-item review, payment method,
  saved trip history, and a basic monthly spending summary. Sharing is blocked
  with an account prompt. All calculations (estimated/actual totals, remaining,
  over-budget, resolved/unresolved) verified end-to-end in a headless browser.
- ✅ **Phase 2 (PWA):** Shopping Mode polish — group by store or category with
  per-group subtotals, item search, a hide-resolved filter, and one-tap
  purchase that prefills the estimated price.
- ✅ **Phase 3 (PWA — account layer):** sign up / sign in / sign out with
  per-account data isolation, guest→account data migration on signup,
  profile display name + default currency, and account-gated sharing.
  Implemented locally (accounts + sessions in this browser) behind an
  interface ready to swap in Supabase Auth when `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are set (see `pwa/.env.example`). Verified
  end-to-end: guest list → signup migrates it → sign out empties the guest
  namespace → sign back in restores it → wrong password rejected → currency
  change applies to new lists.
- ✅ **Phase 3 (cloud scaffolding):** runnable Supabase SQL migration
  (`supabase/migrations/0001_initial_schema.sql`) with tables + **Row Level
  Security** + auto-profile trigger; Supabase client, pure row↔model mappers
  (unit-tested — `npm test`), a sync adapter, and cloud-auth helpers under
  `pwa/src/data/cloud/`. All gated behind `isCloudConfigured`, tree-shaken out
  of the local bundle, and ready to wire once a Supabase project is connected.
- ✅ **Phase 3 (cloud, live):** `AuthProvider` + store use Supabase when
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set, else the local
  backend. Cloud auth (sign up/in/out, profile), per-account data sync
  (guest→account migration on first login, delta push of lists/trips, pull on
  login), all supabase-js code-split out of the local/guest bundle
  (main chunk ~214 kB). **Verified against the live project**: signup +
  auto-profile trigger, RLS-scoped writes, cross-user isolation (a second user
  can't read or write another's data — Postgres `42501`), session persistence,
  and the app mappers round-tripping through the real schema. Diff + mapper
  logic unit-tested (`npm test`, 10/10). Local path re-verified (no regression).
- ⬜ Phase 3 (polish): in-app cross-device E2E on a real browser, offline
  write queue + conflict handling
- ✅ **Phase 4 (shared lists + roles):** `list_members` + `invitations` with
  role-based RLS (viewer/contributor/shopper/owner), invite links, an
  accept-invite RPC, member management, and the free-tier 1-collaborator limit.
  UI gates actions by role; cloud sync pulls owned + shared lists. **Verified
  live**: invite→accept, shopper can edit items but not budget, viewer's
  update/insert/delete all blocked by RLS (`42501` / 0 rows), role
  downgrade + member removal enforced. Unit tests 15/15.
- ✅ **Phase 4 (live collaboration):** Supabase Realtime subscriptions
  (JWT-authorized, RLS-scoped) so a collaborator's edits appear without a
  reload, plus per-item delta sync so simultaneous editors don't clobber each
  other. **Verified live**: a subscribed collaborator receives an owner's
  INSERT event end-to-end.
- ✅ **Phase 5 (permissions & privacy):** explicit private vs shared lists
  (DB trigger keeps `visibility` in step with membership), a Private/Shared
  badge, and a per-collaborator "can view spending" permission that hides
  actual prices/totals in the UI. **Verified live**: private default,
  non-member isolation, join→shared / remove→private transitions, and the
  spending flag round-trip.
- ⬜ Phase 5 hardening (optional): column-level spending enforcement via a
  security-barrier view (UI-gated today)
- ⬜ Phase 6: Multiple lists, stores, and groups

> Scope note: development is **web (PWA) only** going forward — the Android
> module stays at its Phase 0 scaffold.

## Running the PWA

```bash
cd pwa
npm install
npm run dev      # dev server
npm run build    # production build (outputs to pwa/dist)
```

The PWA is installable (web manifest + service worker) and uses the same screen
set and mock data as the Android app. Mobile gets bottom navigation; desktop gets
a sidebar layout.

## Running the Android app

Open `android/` in Android Studio (Ladybug or newer) and run the `app`
configuration, or from the command line with an Android SDK installed:

```bash
cd android
gradle wrapper   # one-time: generates gradlew (wrapper is not committed yet)
./gradlew assembleDebug
```

Requires JDK 17+ and Android SDK 35. `minSdk` is 26. Android Studio will offer
to generate the Gradle wrapper automatically when the project is first opened.

## Build phases

Development follows the phased plan in `docs/BLUEPRINT.md`:

0. **Foundation** *(this phase)* — structure, tokens, navigation, mock data
1. Local Guest Mode MVP — local lists, budgets, prices, shopping mode, trip history
2. Shopping Mode Polish
3. Authentication and Cloud Data (Supabase)
4. Shared Lists and Live Collaboration
5. Permissions and Privacy
6. Multiple Lists, Stores, and Groups
7. Spending Tracker and Basic Reports
8. Subscription System (Google Play Billing)
9. Export
10. Item Requests and Family Workflow
11. Optional Item Photos
12. Price History and Smart Suggestions

## Product rules that shape the code

- Shared access requires an account; guests get local-only lists.
- Subscription unlocks features; **permissions** control actions inside a list.
- Only *purchased* items count as actual spending; estimates are planning-only.
- Private lists and spending are protected at the backend (RLS), never just the UI.
- Never store card numbers or payment credentials — payment *method* + amount only.
- Android and PWA share the same backend, rules, and data model.
