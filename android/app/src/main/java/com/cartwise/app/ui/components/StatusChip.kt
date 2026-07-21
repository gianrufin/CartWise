package com.cartwise.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.cartwise.app.data.model.ItemStatus
import com.cartwise.app.ui.theme.StatusCarriedOver
import com.cartwise.app.ui.theme.StatusPending
import com.cartwise.app.ui.theme.StatusPurchased
import com.cartwise.app.ui.theme.StatusSkipped
import com.cartwise.app.ui.theme.StatusUnavailable

fun ItemStatus.color(): Color = when (this) {
    ItemStatus.PENDING -> StatusPending
    ItemStatus.PURCHASED -> StatusPurchased
    ItemStatus.UNAVAILABLE -> StatusUnavailable
    ItemStatus.SKIPPED -> StatusSkipped
    ItemStatus.CARRIED_OVER -> StatusCarriedOver
}

@Composable
fun StatusChip(status: ItemStatus, modifier: Modifier = Modifier) {
    val color = status.color()
    Text(
        text = status.label,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = modifier
            .background(color.copy(alpha = 0.12f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    )
}
