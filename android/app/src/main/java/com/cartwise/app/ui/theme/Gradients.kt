package com.cartwise.app.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Shared gradient brushes matching the pastel accents in docs/design-tokens.md.
object Gradients {
    val Cyan: Brush = Brush.linearGradient(
        listOf(Color(0xFF58C9F9), Color(0xFF2AA8EE))
    )
    val Purple: Brush = Brush.linearGradient(
        listOf(Color(0xFF8069F7), Color(0xFFA86CF3))
    )
    val AppBackground: Brush = Brush.radialGradient(
        colors = listOf(Color(0xFF56547A), Color(0xFF413F5B), Color(0xFF363450)),
        radius = 1400f
    )
}
