package com.cartwise.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// CartWise uses a single immersive dark glass theme (matches the design
// direction in docs/design-tokens.md). Gradients and glass translucency are
// applied per-component; the color scheme here provides the flat fallbacks.
private val OnCyan = Color(0xFF06222E) // dark ink for text/icons on cyan

private val CartWiseColors = darkColorScheme(
    primary = AccentIndigo,
    onPrimary = TextPrimary,
    primaryContainer = AccentIndigo,
    onPrimaryContainer = TextPrimary,
    secondary = AccentCyan,
    onSecondary = OnCyan,
    background = BgBase,
    onBackground = TextPrimary,
    surface = BgElevated,
    onSurface = TextPrimary,
    surfaceVariant = GlassSurfaceStrong,
    onSurfaceVariant = TextMuted,
    outline = GlassBorder,
    error = Danger,
    onError = TextPrimary
)

@Composable
fun CartWiseTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = CartWiseColors,
        typography = CartWiseTypography,
        content = content
    )
}
