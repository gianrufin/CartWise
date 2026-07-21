package com.cartwise.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.theme.Danger
import com.cartwise.app.ui.theme.Dimens
import com.cartwise.app.ui.theme.Warning

/**
 * Sticky summary shown at the top of Shopping Mode: budget, cart total,
 * remaining, and resolved/unresolved counts. Turns amber near budget and
 * red when over budget.
 */
@Composable
fun BudgetSummaryBar(
    budget: Double?,
    cartTotal: Double,
    resolvedCount: Int,
    unresolvedCount: Int,
    currency: String = "PHP",
    modifier: Modifier = Modifier
) {
    val remaining = (budget ?: 0.0) - cartTotal
    val overBudget = budget != null && remaining < 0
    val nearBudget = budget != null && !overBudget && budget > 0 && cartTotal >= budget * 0.85
    val remainingColor = when {
        overBudget -> Danger
        nearBudget -> Warning
        else -> MaterialTheme.colorScheme.primary
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = Dimens.SpaceXs
    ) {
        Column(Modifier.padding(Dimens.SpaceLg)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                SummaryCell("Budget", budget?.let { formatCurrency(it, currency, compact = true) } ?: "—")
                SummaryCell("Cart total", formatCurrency(cartTotal, currency, compact = true), emphasize = true)
                SummaryCell(
                    if (overBudget) "Over budget" else "Remaining",
                    formatCurrency(kotlin.math.abs(remaining), currency, compact = true),
                    valueColor = remainingColor
                )
            }
            Spacer(Modifier.height(Dimens.SpaceSm))
            Text(
                text = "$resolvedCount resolved · $unresolvedCount to go",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SummaryCell(
    label: String,
    value: String,
    emphasize: Boolean = false,
    valueColor: Color? = null
) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = if (emphasize) MaterialTheme.typography.displaySmall
            else MaterialTheme.typography.titleMedium,
            color = valueColor ?: MaterialTheme.colorScheme.onSurface
        )
    }
}
