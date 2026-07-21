package com.cartwise.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.data.model.ListItem
import com.cartwise.app.ui.theme.Dimens

/** Item row for List Detail: name, quantity, estimated price, status, store/category. */
@Composable
fun ListItemRow(
    item: ListItem,
    currency: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .defaultMinSize(minHeight = Dimens.TouchTarget)
            .clickable(onClick = onClick)
            .padding(horizontal = Dimens.SpaceLg, vertical = Dimens.SpaceMd),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(Modifier.weight(1f)) {
            Text(item.name, style = MaterialTheme.typography.bodyLarge)
            val quantityLabel = buildString {
                append(trimQuantity(item.quantity))
                item.unit?.let { append(" $it") }
                item.store?.let { append(" · $it") }
                item.category?.let { append(" · $it") }
            }
            Text(
                quantityLabel,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(
                item.estimatedTotalPrice?.let { formatCurrency(it, currency, compact = true) } ?: "—",
                style = MaterialTheme.typography.bodyMedium
            )
            StatusChip(item.status)
        }
    }
}

private fun trimQuantity(quantity: Double): String =
    if (quantity % 1.0 == 0.0) quantity.toInt().toString() else quantity.toString()
