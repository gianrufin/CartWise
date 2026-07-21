package com.cartwise.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.data.mock.MockData
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.theme.Dimens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TripSummaryScreen(
    tripId: String?,
    onDone: () -> Unit
) {
    val trip = MockData.completedTrips.firstOrNull { it.id == tripId }
        ?: MockData.completedTrips.first()
    val underBudget = trip.budgetAmount != null && trip.actualTotal <= trip.budgetAmount

    Scaffold(
        topBar = { TopAppBar(title = { Text("Trip summary") }) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(Dimens.SpaceLg),
            verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
        ) {
            item {
                Card(
                    Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .padding(Dimens.SpaceXl),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "Total spent",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            formatCurrency(trip.actualTotal, trip.currency, compact = true),
                            style = MaterialTheme.typography.displaySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        trip.budgetAmount?.let { budget ->
                            val diff = kotlin.math.abs(budget - trip.actualTotal)
                            Text(
                                if (underBudget)
                                    "${formatCurrency(diff, trip.currency, compact = true)} under a " +
                                        "${formatCurrency(budget, trip.currency, compact = true)} budget"
                                else
                                    "${formatCurrency(diff, trip.currency, compact = true)} over a " +
                                        "${formatCurrency(budget, trip.currency, compact = true)} budget",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                }
            }
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(Dimens.SpaceLg)) {
                        SummaryRow("List", trip.listName)
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Date", trip.completedAtLabel)
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Payment method", trip.paymentMethod.label)
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Purchased", "${trip.purchasedCount} items")
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Unavailable", "${trip.unavailableCount} items")
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Skipped", "${trip.skippedCount} items")
                        HorizontalDivider(Modifier.padding(vertical = Dimens.SpaceSm))
                        SummaryRow("Carried over", "${trip.carriedOverCount} items")
                    }
                }
            }
            item {
                Button(
                    onClick = onDone,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(Dimens.TouchTarget)
                ) {
                    Text("Done")
                }
            }
            item {
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(Dimens.TouchTarget)
                ) {
                    Text("Start new list from carried-over items")
                }
            }
        }
    }
}

@Composable
private fun SummaryRow(label: String, value: String) {
    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}
