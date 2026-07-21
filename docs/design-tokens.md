# CartWise design tokens

Single source of truth for the shared visual language. Mirrored in code at:

- Android: `android/app/src/main/java/com/cartwise/app/ui/theme/` (`Color.kt`, `Type.kt`, `Dimens.kt`)
- PWA: `pwa/src/styles/tokens.css` (CSS custom properties)

Design direction: clean, friendly, practical, budget-focused, and usable while
walking through a grocery store — large touch targets, clear totals, high
contrast, fast item actions, minimal typing.

## Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `primary` | `#0E9F6E` | `#34D399` | Brand green — actions, FAB, links |
| `on-primary` | `#FFFFFF` | `#06281C` | Text/icons on primary |
| `primary-container` | `#D1FAE5` | `#064E3B` | Chips, selected states |
| `secondary` | `#0E7490` | `#22D3EE` | Accents, info highlights |
| `background` | `#F8FAF9` | `#101613` | App background |
| `surface` | `#FFFFFF` | `#1A211D` | Cards, sheets, bars |
| `surface-variant` | `#EEF2F0` | `#242D28` | Grouped rows, inputs |
| `on-surface` | `#1B211E` | `#E6EBE8` | Primary text |
| `on-surface-muted` | `#5C6660` | `#9AA59F` | Secondary text, captions |
| `outline` | `#D3DBD7` | `#3A453F` | Dividers, borders |
| `warning` | `#B45309` | `#F59E0B` | Near-budget warnings |
| `danger` | `#DC2626` | `#F87171` | Over budget, destructive |

### Item status colors

| Status | Color (light/dark) | Label |
| --- | --- | --- |
| pending | `#5C6660` / `#9AA59F` | Pending |
| purchased | `#0E9F6E` / `#34D399` | Purchased |
| unavailable | `#DC2626` / `#F87171` | Unavailable |
| skipped | `#B45309` / `#F59E0B` | Skipped |
| carried_over | `#2563EB` / `#60A5FA` | Carried over |

## Typography

System font stacks (Roboto on Android, system UI stack on web).

| Token | Size / weight | Use |
| --- | --- | --- |
| `display` | 28sp / bold | Big totals (cart total, trip total) |
| `title-lg` | 22sp / semibold | Screen titles |
| `title` | 18sp / semibold | Card titles, list names |
| `body` | 16sp / regular | Item names, default text |
| `body-sm` | 14sp / regular | Secondary info, prices in rows |
| `caption` | 12sp / medium | Status chips, labels |

## Spacing & shape

- Spacing scale: `4, 8, 12, 16, 24, 32` (dp/px)
- Corner radius: `12` cards, `16` sheets, `28` FAB/pills
- Minimum touch target: `48dp` — non-negotiable in shopping mode
- Sticky budget summary height: ~`88dp`

## Currency formatting

- Default currency: PHP, symbol `₱`, thousands separators, 2 decimals
  (drop decimals when `.00` in compact rows): `₱3,000` / `₱370.50`
- Currency is per list; never auto-convert.
