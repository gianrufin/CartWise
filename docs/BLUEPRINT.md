# CartWise — Product Blueprint

Working name: **CartWise** (project name `cartwise`). Android-first grocery planning,
live shopping, and household spending tracker, with a full-featured PWA. Launch
market: Philippines. Default currency: PHP (multi-currency, no auto-conversion in MVP).

**Value proposition:** Plan together, shop live, and stay within budget.

**Monetization:** subscription-only, no ads. Each member subscribes independently.
Subscription controls what features a user can access; permissions control what a
user can do inside a list. A free invited user can still participate in a premium
owner's shared list with basic actions.

## Product modes

1. **Guest** — no account. Local lists, budgets, prices, shopping mode, local trip
   history. No sharing/sync/premium. Sharing prompt: *"Create a free account to
   share this list and sync it across devices."* Guest data migrates on signup.
2. **Free account** — sync across Android + PWA, 1 active shared list,
   1 collaborator, live collaboration, basic budget/history/reports (30–60 days),
   no export, no advanced roles, no photos.
3. **Premium individual** — more lists/collaborators, private lists, advanced
   permissions, multiple stores per trip, payment methods, full history, CSV export
   (PDF later), advanced analytics, price history, item photos, request workflows.

## Core product rules

1. Shared access requires an account.
2. No account → local personal lists only.
3. A list has exactly one owner; the owner controls permissions.
4. A list is private or shared; private lists are invisible to non-owners.
5. Subscription unlocks features; permissions control actions.
6. Only purchased items count as actual spending. Estimated prices are planning
   only; actual prices drive trip totals and history.
7. A completed trip is read-only unless reopened by an allowed user.
8. Private spending never appears in shared reports.
9. Every unresolved item must be handled before final trip completion, unless
   carried over.
10. Android and PWA use the same backend, rules, and data model.
11. Offline editing where practical; live collaboration updates quickly.
12. Never store sensitive financial data (card numbers etc.).
13. Photos are optional, compressed, limited. Users can delete their own data.

## Entities (summary)

See `docs/backend/schema-plan.sql` for the full field-level plan.

- **User** — account, default_currency, subscription status/plan.
- **Household/Group** — flexible group (family, couple, roommates, friends).
- **HouseholdMember** — roles: owner, manager, shopper, contributor, request_only, viewer.
- **Invitation** — expiring, revocable invite tokens; content hidden until sign-in.
- **ShoppingList** — budget, currency, visibility (private / shared_selected /
  shared_household / invite_only), status (active / archived / deleted).
- **ListMemberPermission** — role plus granular `can_*` toggles (role-based for MVP).
- **Store** — e.g. SM Supermarket, Wet Market, Mercury Drug, Sari-sari Store.
- **Category** — defaults: Produce, Meat and Seafood, Dairy, Pantry, Snacks,
  Beverages, Household, Personal Care, Baby and Kids, Pets, Pharmacy, Other.
- **ListItem** — quantity/unit, estimated + actual unit/total prices, priority
  (essential / normal / optional), status (pending, requested, approved, in_cart,
  purchased, unavailable, skipped, replaced, carried_over, removed). MVP-visible
  statuses: Pending, Purchased, Unavailable, Skipped, Carried over.
- **ItemRequest** — request-only workflow (pending / approved / declined / edited / cancelled).
- **ShoppingTrip** — active / completed / reopened / cancelled; budget vs actual totals.
- **TripPayment** — method (cash, gcash, maya, debit_card, credit_card,
  bank_transfer, voucher, other) + amount. Never card numbers.
- **ItemPriceHistory** (post-MVP), **Subscription** (Google Play Billing first).

## Roles (MVP)

- **Owner** — full control, invites, budget, complete trips, delete list, export (premium).
- **Shopper** — view, update item status, enter prices, add items, complete trip if allowed.
- **Contributor** — view, add items, edit own items; no budget changes; no trip completion.
- **Viewer** — view only.
- **Request-only** — submit item requests only.

Custom permission toggles (change budget, invite, approve requests, complete trip,
view spending, export, delete items, manage stores, view payment methods) come later.

## Design direction

Immersive **dark glassmorphism**: deep indigo backdrop, frosted translucent
glass cards, pastel gradient accents (cyan / indigo-purple / coral), and a
glowing cyan center action button in the bottom navigation that launches Quick
Tally. See `docs/design-tokens.md` for the full palette and shape scale.

## Quick Tally (persistent calculator)

A persistent, always-available running calculator for **stacking grocery prices
on the fly** — no list required. Punch in a price, tap **+**, and it adds to a
running total shown large at the top; an editable "tape" lists every entry.

- **Item names are optional** — the feature is price-first; unnamed entries show
  as "Item".
- **Persistent** — entries and total survive app reloads/restarts (localStorage
  on web; `rememberSaveable` now on Android, Room in Phase 1).
- Reachable from the glowing **center button** in the bottom nav on every main
  screen, and from a shortcut card on Home.
- Guest-friendly and offline (no account needed). Future phases can link a tally
  into a list/trip and carry entries into item prices.

## App sections

1. **Onboarding** — Welcome, continue as guest, create account, sign in, select
   currency, create first list, optional invite. Goal: first list ASAP.
2. **Home dashboard** — active lists, active trips, monthly spending summary,
   recent trips, quick create; upsells only when relevant.
3. **List detail** — name, budget, remaining estimate, items grouped by
   category/store, members, add item, start shopping, settings.
4. **Add/edit item** — name, quantity, unit, estimated unit/total price, store,
   category, priority, notes. Unit↔total price auto-calculation; mismatch warning.
5. **Shopping mode** *(the most important experience)* — sticky summary (budget,
   cart total, remaining, resolved/unresolved counts); item actions: purchased
   (+ actual price), unavailable, skip, carry over, substitute later. Instant total
   updates, budget warnings, live sync.
6. **End-of-trip review** — resolve every remaining item (purchase / unavailable /
   skip / carry over / remove), then payment method, then complete.
7. **Trip summary** — spent vs budget, item outcomes, payment method, store
   breakdown, shopper, date; duplicate list / start list from carried-over items.
8. **Reports** — MVP: monthly total, recent trips, budget vs actual, spending by
   list. Premium later: by category/store/payment method, price history, exports.
9. **Settings** — profile, currency, subscription, households, privacy, export,
   delete account.

## Live collaboration

Real-time sync for item add/edit/status/price, budget changes, deletes, trip
completion, membership, requests. Lightweight activity ("Anna added Milk").
Field-level updates, last-write-wins on simple fields, confirm-on-delete when
recently edited by someone else, lock after trip completion.

## Offline (MVP)

Guest mode fully offline. Signed-in users: cached lists readable offline; item
status/prices editable offline; sync on reconnect; latest synced update wins.
Keep conflict handling practical — don't overbuild.

## Technical direction

- **Android:** Kotlin, Jetpack Compose, Room, WorkManager, Material 3, Google Play Billing.
- **PWA:** React (Vite), responsive, IndexedDB, service worker, installable.
- **Backend:** Supabase — PostgreSQL, Auth, Realtime, Storage, Row Level Security.
  (Relational data, permission rules, SQL reports, realtime — Supabase fits.)

## Build phases

| Phase | Goal |
| --- | --- |
| 0 | Foundation: structure, tokens, navigation, placeholder screens, mock data |
| 1 | Local Guest Mode MVP: local lists, budgets, prices, shopping mode, history |
| 2 | Shopping Mode Polish: sticky summary, fast actions, warnings, grouping, end-of-trip flow |
| 3 | Auth + Cloud Data: Supabase auth, sync, guest→account migration |
| 4 | Shared Lists + Live Collaboration: invites, 1 free collaborator, realtime, roles |
| 5 | Permissions + Privacy: private lists, role permissions, RLS enforcement |
| 6 | Multiple Lists, Stores, Groups: households, multi-store, duplication, archive |
| 7 | Spending Tracker + Reports: monthly totals, budget vs actual, breakdowns |
| 8 | Subscriptions: free limits, entitlements, Google Play Billing, graceful downgrade |
| 9 | Export: premium CSV with filters; owner-only for private lists |
| 10 | Item Requests + Family Workflow: request-only role, approvals |
| 11 | Optional Item Photos: one compressed photo per item, metadata stripped |
| 12 | Price History + Smart Suggestions |

Branch names: `phase-0-foundation` … `phase-12-price-history`.
Commit style: `feat: …`, `fix: …`, `chore: …`.

## First release scope

Guest mode, account mode, migration, private + shared lists, one free
collaborator, live collaboration, items, budgets, estimated/actual prices,
shopping mode, end-of-trip review, payment method, trip summary, basic history,
basic reports, Android + full PWA, subscription screen, entitlement foundation.

**Not** in first release: photos, advanced analytics, PDF export, barcode
scanning, receipt OCR, price comparison, AI meal planning, pantry tracking.

## Key warnings

- Don't overbuild early — shopping mode quality is priority #1.
- Build permissions early — they affect the data model, backend rules, UI, sharing.
- Keep subscription rules simple: owner's plan gates list-level features; member's
  plan gates personal premium tools; basic collaboration always works for invitees.
- Protect private data at the database level, not with hidden buttons.
- PWA equal in features, adapted in layout.

## Core empty states

- No lists: "Create your first grocery list and start tracking your budget."
- No shared lists: "Share a list with someone after creating an account."
- No reports: "Complete a shopping trip to see your spending summary."
- Guest sharing blocked: "Create a free account to share this list and sync it across devices."
- Premium locked: "Upgrade to unlock more lists, collaborators, exports, and full spending history."

## MVP acceptance test script (abridged)

**Guest:** continue as guest → list "Weekly Groceries", PHP, ₱3,000 budget →
add Rice 5kg ₱350, Eggs 1 tray ₱240, Chicken 1kg ₱220 → shop → Rice purchased
₱370, Eggs purchased ₱250, Chicken unavailable → finish → unresolved flow →
Cash → total ₱620 → trip in history → sharing prompts account creation.

**Migration:** guest list → sign up → list migrates → survives sign out/in.

**Shared:** A creates shared list → invites B → B must sign in → live updates
both directions.

**Budget:** ₱1,000 budget → actual prices above it → over-budget warning.

**Privacy:** private list visible only to owner; not in shared reports; blocked
by backend, not URL-guessable.

**Permissions:** viewer can't edit; promoted shopper can mark purchased + enter
prices but not change budget.
