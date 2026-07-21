package com.cartwise.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.data.mock.MockData
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.components.EmptyState
import com.cartwise.app.ui.theme.Dimens

@Composable
fun ListsScreen(onOpenList: (String) -> Unit) {
    if (MockData.lists.isEmpty()) {
        EmptyState(
            icon = Icons.AutoMirrored.Filled.ListAlt,
            message = "Create your first grocery list and start tracking your budget."
        )
        return
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(Dimens.SpaceLg),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
    ) {
        item { Text("Lists", style = MaterialTheme.typography.titleLarge) }
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
                            "${list.unresolvedCount} pending of ${list.items.size} items",
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
    }
}
