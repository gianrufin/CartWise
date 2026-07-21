package com.cartwise.app.ui.theme

import androidx.compose.ui.graphics.Color

// Dark glassmorphism theme — mirrors docs/design-tokens.md and
// pwa/src/styles/tokens.css. Deep indigo backdrop with translucent "glass"
// surfaces (approximated on Android with layered translucent colors, since
// Compose has no cheap backdrop blur), pastel gradient accents, and a glowing
// cyan center action. Immersive dark theme (single look).

// Backdrop
val BgBase = Color(0xFF3B3A52)
val BgElevated = Color(0xFF464463)

// Glass surfaces (white at low alpha over the indigo backdrop)
val GlassSurface = Color(0x12FFFFFF)      // ~7% white
val GlassSurfaceStrong = Color(0x1CFFFFFF) // ~11% white
val GlassBorder = Color(0x24FFFFFF)        // ~14% white

// Text
val TextPrimary = Color(0xFFFFFFFF)
val TextMuted = Color(0xA3FFFFFF)   // ~64%
val TextFaint = Color(0x6BFFFFFF)   // ~42%

// Accents
val AccentCyan = Color(0xFF52C5F7)
val AccentCyanDeep = Color(0xFF2AA8EE)
val AccentIndigo = Color(0xFF7C6CF6)
val AccentPurple = Color(0xFFA672F6)
val Coral = Color(0xFFF0846A)

// Semantic
val Positive = Color(0xFF38D9A9)
val Warning = Color(0xFFF5B14C)
val Danger = Color(0xFFF87171)

// Item status colors (tuned for dark glass)
val StatusPending = Color(0x8CFFFFFF)
val StatusPurchased = Color(0xFF38D9A9)
val StatusUnavailable = Color(0xFFF87171)
val StatusSkipped = Color(0xFFF5B14C)
val StatusCarriedOver = Color(0xFF6AB0FF)
