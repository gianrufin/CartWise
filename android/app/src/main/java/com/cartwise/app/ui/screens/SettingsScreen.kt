package com.cartwise.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.ui.theme.Dimens

private data class SettingsEntry(val title: String, val subtitle: String)

// Placeholder settings — sections become functional across Phases 3–9.
private val entries = listOf(
    SettingsEntry("Profile", "Guest — create an account to sync"),
    SettingsEntry("Currency", "PHP (₱) — default"),
    SettingsEntry("Subscription", "Free plan"),
    SettingsEntry("Households and groups", "Available with an account"),
    SettingsEntry("Privacy", "Private lists, data visibility"),
    SettingsEntry("Data export", "Premium feature"),
    SettingsEntry("Delete my data", "Remove local data from this device")
)

@Composable
fun SettingsScreen() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Dimens.SpaceLg),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
    ) {
        item { Text("Settings", style = MaterialTheme.typography.titleLarge) }
        item {
            Card(Modifier.fillMaxWidth()) {
                Column {
                    entries.forEachIndexed { index, entry ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .defaultMinSize(minHeight = Dimens.TouchTarget)
                                .clickable { }
                                .padding(Dimens.SpaceLg),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(entry.title, style = MaterialTheme.typography.bodyLarge)
                                Text(
                                    entry.subtitle,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        if (index < entries.lastIndex) HorizontalDivider()
                    }
                }
            }
        }
        item {
            Text(
                "CartWise 0.1.0 — Phase 0 foundation build",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
