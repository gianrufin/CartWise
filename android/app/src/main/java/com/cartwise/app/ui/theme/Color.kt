package com.cartwise.app.ui.theme

import androidx.compose.ui.graphics.Color

// Mirrors docs/design-tokens.md — keep in sync with pwa/src/styles/tokens.css.

// Light
val PrimaryLight = Color(0xFF0E9F6E)
val OnPrimaryLight = Color(0xFFFFFFFF)
val PrimaryContainerLight = Color(0xFFD1FAE5)
val OnPrimaryContainerLight = Color(0xFF06281C)
val SecondaryLight = Color(0xFF0E7490)
val BackgroundLight = Color(0xFFF8FAF9)
val SurfaceLight = Color(0xFFFFFFFF)
val SurfaceVariantLight = Color(0xFFEEF2F0)
val OnSurfaceLight = Color(0xFF1B211E)
val OnSurfaceMutedLight = Color(0xFF5C6660)
val OutlineLight = Color(0xFFD3DBD7)

// Dark
val PrimaryDark = Color(0xFF34D399)
val OnPrimaryDark = Color(0xFF06281C)
val PrimaryContainerDark = Color(0xFF064E3B)
val OnPrimaryContainerDark = Color(0xFFD1FAE5)
val SecondaryDark = Color(0xFF22D3EE)
val BackgroundDark = Color(0xFF101613)
val SurfaceDark = Color(0xFF1A211D)
val SurfaceVariantDark = Color(0xFF242D28)
val OnSurfaceDark = Color(0xFFE6EBE8)
val OnSurfaceMutedDark = Color(0xFF9AA59F)
val OutlineDark = Color(0xFF3A453F)

// Semantic
val Warning = Color(0xFFB45309)
val Danger = Color(0xFFDC2626)

// Item status colors (light theme values; dark handled by theme lookup later)
val StatusPending = Color(0xFF5C6660)
val StatusPurchased = Color(0xFF0E9F6E)
val StatusUnavailable = Color(0xFFDC2626)
val StatusSkipped = Color(0xFFB45309)
val StatusCarriedOver = Color(0xFF2563EB)
