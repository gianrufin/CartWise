# CartWise design tokens

Single source of truth for the shared visual language. Mirrored in code at:

- Android: `android/app/src/main/java/com/cartwise/app/ui/theme/` (`Color.kt`, `Gradients.kt`, `Type.kt`, `Dimens.kt`)
- PWA: `pwa/src/styles/tokens.css` (CSS custom properties)

## Design direction — dark glassmorphism

An immersive **dark** theme (single look, no light mode): a deep desaturated
indigo backdrop with a soft radial glow, **frosted translucent "glass" cards**
(low-alpha white fill, subtle light border, backdrop blur, large corner radius),
pastel gradient accents, and a **glowing cyan center action button** in the
bottom navigation. Big totals, large touch targets, high contrast, fast item
actions, minimal typing — tuned for use while walking a grocery store.

On the web, glass = `backdrop-filter: blur()` over low-alpha white. On Android,
Compose has no cheap backdrop blur, so glass is approximated with layered
translucent white surfaces over the indigo backdrop.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `bg-base` | `#3B3A52` | App background (flat fallback) |
| `bg-radial` | radial `#56547A → #413F5B → #363450` | App background glow |
| `glass-bg` | `rgba(255,255,255,0.07)` | Card fill |
| `glass-bg-strong` | `rgba(255,255,255,0.11)` | Elevated / selected fill |
| `glass-border` | `rgba(255,255,255,0.14)` | Card & control borders |
| `text` | `#FFFFFF` | Primary text |
| `text-muted` | `rgba(255,255,255,0.64)` | Secondary text |
| `text-faint` | `rgba(255,255,255,0.42)` | Placeholders, captions |
| `accent` | `#52C5F7` | Primary glow, center button, links |
| `accent-cyan-grad` | `#58C9F9 → #2AA8EE` | Cyan buttons, tally, hero |
| `accent-indigo` | `#7C6CF6` | Indigo accent |
| `accent-purple-grad` | `#8069F7 → #A86CF3` | Primary buttons, hero cards |
| `coral` | `#F0846A` | Warm accent |
| `positive` | `#38D9A9` | Under budget / purchased |
| `warning` | `#F5B14C` | Near-budget warnings |
| `danger` | `#F87171` | Over budget, destructive |

Ink on cyan/light gradients is dark (`#06222E`) for contrast.

### Item status colors

| Status | Value | Label |
| --- | --- | --- |
| pending | `rgba(255,255,255,0.55)` | Pending |
| purchased | `#38D9A9` | Purchased |
| unavailable | `#F87171` | Unavailable |
| skipped | `#F5B14C` | Skipped |
| carried_over | `#6AB0FF` | Carried over |

## Typography

System font stacks (Roboto on Android, system UI stack on web).

| Token | Size / weight | Use |
| --- | --- | --- |
| `display` | 30 / bold | Big totals (cart total, running total) |
| `title-lg` | 23 / bold | Screen titles, greeting |
| `title` | 18 / semibold | Card titles, list names |
| `body` | 16 / regular | Item names, default text |
| `body-sm` | 14 / regular | Secondary info, prices in rows |
| `caption` | 12 / medium | Status chips, labels |

## Spacing & shape

- Spacing scale: `4, 8, 12, 16, 24, 32` (dp/px)
- Corner radius: `24` cards, `28` sheets, `999` pills/FAB
- Minimum touch target: `48dp` — non-negotiable in shopping mode
- Center nav button: 58dp glowing cyan circle, raised above the bar

## Currency formatting

- Default currency: PHP, symbol `₱`, thousands separators, 2 decimals
  (drop decimals when `.00` in compact rows): `₱3,000` / `₱370.50`
- Currency is per list; never auto-convert.
