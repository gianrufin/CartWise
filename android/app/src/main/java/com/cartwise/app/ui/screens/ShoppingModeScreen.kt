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
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import com.cartwise.app.data.mock.MockData
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.data.model.ItemStatus
import com.cartwise.app.data.model.ListItem
import com.cartwise.app.ui.components.BudgetSummaryBar
import com.cartwise.app.ui.components.StatusChip
import com.cartwise.app.ui.theme.Dimens

/**
 * Shopping Mode — the most important experience in the app.
 * Phase 0: interactive with in-memory state on top of mock data; totals react
 * to status changes and price entry. Persistence arrives in Phase 1.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingModeScreen(
    listId: String?,
    onBack: () -> Unit,
    onFinish: () -> Unit
) {
    val list = MockData.listById(listId)
    var items by remember { mutableStateOf(list.items) }

    // Only purchased items count as actual spending.
    val cartTotal = items
        .filter { it.status == ItemStatus.PURCHASED }
        .sumOf { it.actualTotalPrice ?: 0.0 }
    val resolvedCount = items.count { it.isResolved }
    val unresolvedCount = items.size - resolvedCount

    fun update(item: ListItem, transform: (ListItem) -> ListItem) {
        items = items.map { if (it.id == item.id) transform(it) else it }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shopping · ${list.name}") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            BudgetSummaryBar(
                budget = list.budgetAmount,
                cartTotal = cartTotal,
                resolvedCount = resolvedCount,
                unresolvedCount = unresolvedCount,
                currency = list.currency
            )
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(Dimens.SpaceLg),
                verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
            ) {
                items(items, key = { it.id }) { item ->
                    ShoppingItemCard(
                        item = item,
                        currency = list.currency,
                        onSetStatus = { status -> update(item) { it.copy(status = status) } },
                        onActualPrice = { price -> update(item) { it.copy(actualTotalPrice = price) } }
                    )
                }
            }
            Button(
                onClick = onFinish,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(Dimens.SpaceLg)
                    .height(Dimens.TouchTarget)
            ) {
                Text(
                    if (unresolvedCount > 0) "Finish shopping ($unresolvedCount unresolved)"
                    else "Finish shopping"
                )
            }
        }
    }
}

@Composable
private fun ShoppingItemCard(
    item: ListItem,
    currency: String,
    onSetStatus: (ItemStatus) -> Unit,
    onActualPrice: (Double?) -> Unit
) {
    var priceText by remember(item.id) {
        mutableStateOf(item.actualTotalPrice?.toString() ?: "")
    }

    Card(Modifier.fillMaxWidth()) {
        Column(
            Modifier.padding(Dimens.SpaceLg),
            verticalArrangement = Arrangement.spacedBy(Dimens.SpaceSm)
        ) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(Modifier.weight(1f)) {
                    Text(item.name, style = MaterialTheme.typography.titleMedium)
                    val detail = buildString {
                        append(if (item.quantity % 1.0 == 0.0) item.quantity.toInt() else item.quantity)
                        item.unit?.let { append(" $it") }
                        item.store?.let { append(" · $it") }
                        append(" · est. ")
                        append(
                            item.estimatedTotalPrice?.let { formatCurrency(it, currency, compact = true) } ?: "—"
                        )
                    }
                    Text(
                        detail,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    item.notes?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                StatusChip(item.status)
            }
            OutlinedTextField(
                value = priceText,
                onValueChange = { text ->
                    priceText = text
                    onActualPrice(text.toDoubleOrNull())
                },
                label = { Text("Actual price (₱)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            Row(horizontalArrangement = Arrangement.spacedBy(Dimens.SpaceSm)) {
                StatusAction("Purchased", item.status == ItemStatus.PURCHASED) {
                    onSetStatus(ItemStatus.PURCHASED)
                }
                StatusAction("Unavailable", item.status == ItemStatus.UNAVAILABLE) {
                    onSetStatus(ItemStatus.UNAVAILABLE)
                }
                StatusAction("Skip", item.status == ItemStatus.SKIPPED) {
                    onSetStatus(ItemStatus.SKIPPED)
                }
                StatusAction("Carry over", item.status == ItemStatus.CARRIED_OVER) {
                    onSetStatus(ItemStatus.CARRIED_OVER)
                }
            }
        }
    }
}

@Composable
private fun StatusAction(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(selected = selected, onClick = onClick, label = { Text(label) })
}
