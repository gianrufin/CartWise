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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.cartwise.app.data.mock.MockData
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.components.ListItemRow
import com.cartwise.app.ui.theme.Dimens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ListDetailScreen(
    listId: String?,
    onBack: () -> Unit,
    onAddItem: () -> Unit,
    onStartShopping: () -> Unit
) {
    val list = MockData.listById(listId)
    val remaining = (list.budgetAmount ?: 0.0) - list.estimatedTotal
    val grouped = list.items.groupBy { it.category ?: "Other" }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(list.name) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddItem) {
                Icon(Icons.Filled.Add, contentDescription = "Add item")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(Dimens.SpaceLg),
            verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
        ) {
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(Dimens.SpaceLg)) {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    "Budget",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    list.budgetAmount?.let { formatCurrency(it, list.currency, compact = true) } ?: "—",
                                    style = MaterialTheme.typography.titleMedium
                                )
                            }
                            Column {
                                Text(
                                    "Estimated",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    formatCurrency(list.estimatedTotal, list.currency, compact = true),
                                    style = MaterialTheme.typography.titleMedium
                                )
                            }
                            Column {
                                Text(
                                    if (remaining >= 0) "Remaining" else "Over budget",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    formatCurrency(kotlin.math.abs(remaining), list.currency, compact = true),
                                    style = MaterialTheme.typography.titleMedium,
                                    color = if (remaining >= 0) MaterialTheme.colorScheme.primary
                                    else MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                }
            }
            item {
                Button(
                    onClick = onStartShopping,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(Dimens.TouchTarget)
                ) {
                    Text("Start shopping")
                }
            }
            grouped.forEach { (category, items) ->
                item {
                    Text(
                        category,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(top = Dimens.SpaceSm)
                    )
                }
                item {
                    Card(Modifier.fillMaxWidth()) {
                        Column {
                            items.forEachIndexed { index, listItem ->
                                ListItemRow(item = listItem, currency = list.currency)
                                if (index < items.lastIndex) HorizontalDivider()
                            }
                        }
                    }
                }
            }
            item {
                Text(
                    "Sharing requires an account. Create a free account to share this list and sync it across devices.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
