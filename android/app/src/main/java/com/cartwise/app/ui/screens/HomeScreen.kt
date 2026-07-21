package com.cartwise.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.data.mock.MockData
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.theme.Dimens

@Composable
fun HomeScreen(
    onOpenList: (String) -> Unit,
    onOpenTrip: (String) -> Unit
) {
    Scaffold(
        floatingActionButton = {
            // Quick create — wired to real list creation in Phase 1.
            FloatingActionButton(onClick = { }) {
                Icon(Icons.Filled.Add, contentDescription = "Create list")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(Dimens.SpaceLg),
            verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
        ) {
            item {
                Text("Home", style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(Dimens.SpaceSm))
            }
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(Modifier.padding(Dimens.SpaceLg)) {
                        Text(
                            "This month",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            formatCurrency(MockData.monthSpendingTotal, compact = true),
                            style = MaterialTheme.typography.displaySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            "${MockData.completedTrips.size} trips completed",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
            item {
                Text("Active lists", style = MaterialTheme.typography.titleMedium)
            }
            items(MockData.lists) { list ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenList(list.id) }
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(Dimens.SpaceLg),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(list.name, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "${list.items.size} items · budget " +
                                    (list.budgetAmount?.let { formatCurrency(it, list.currency, compact = true) } ?: "—"),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Text(
                            formatCurrency(list.estimatedTotal, list.currency, compact = true),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            item {
                Spacer(Modifier.height(Dimens.SpaceSm))
                Text("Recent trips", style = MaterialTheme.typography.titleMedium)
            }
            items(MockData.completedTrips) { trip ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenTrip(trip.id) }
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(Dimens.SpaceLg),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(trip.listName, style = MaterialTheme.typography.bodyLarge)
                            Text(
                                trip.completedAtLabel + " · " + trip.paymentMethod.label,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Text(
                            formatCurrency(trip.actualTotal, trip.currency, compact = true),
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                }
            }
            item {
                Text(
                    "You're in guest mode. Create a free account to share lists and sync across devices.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = Dimens.SpaceSm)
                )
            }
        }
    }
}
