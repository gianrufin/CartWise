package com.cartwise.app.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.ui.components.EmptyState

// Placeholder tab — real reports arrive in Phase 7.
@Composable
fun ReportsScreen() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        EmptyState(
            icon = Icons.Filled.BarChart,
            message = "Complete a shopping trip to see your spending summary."
        )
    }
}
