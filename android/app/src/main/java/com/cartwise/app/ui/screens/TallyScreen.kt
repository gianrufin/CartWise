package com.cartwise.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.cartwise.app.data.mock.formatCurrency
import com.cartwise.app.ui.theme.Dimens
import com.cartwise.app.ui.theme.Gradients

/**
 * Quick Tally — the persistent grocery calculator.
 * Punch in a price, tap +, and it stacks onto a running total; the item name
 * is optional. Entries survive configuration changes via rememberSaveable;
 * cross-session persistence (matching the PWA's localStorage) arrives with
 * Room in Phase 1.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TallyScreen(onBack: () -> Unit) {
    // Encoded as "amount|name" strings so the list is Saveable without a parcel.
    var encoded by rememberSaveable { mutableStateOf(listOf<String>()) }
    var amountText by rememberSaveable { mutableStateOf("") }
    var nameText by rememberSaveable { mutableStateOf("") }

    val entries = encoded.map { decodeEntry(it) }
    val total = entries.sumOf { it.first }
    val amount = amountText.toDoubleOrNull()
    val canAdd = amount != null && amount != 0.0

    fun add() {
        val value = amount ?: return
        if (value == 0.0) return
        encoded = encoded + encodeEntry(value, nameText.trim())
        amountText = ""
        nameText = ""
    }

    Scaffold(
        topBar = {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(Dimens.SpaceMd),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Text("Quick Tally", style = MaterialTheme.typography.titleLarge)
            }
        },
        bottomBar = {
            EntryBar(
                amountText = amountText,
                onAmountChange = { amountText = it },
                nameText = nameText,
                onNameChange = { nameText = it },
                canAdd = canAdd,
                onAdd = { add() },
                onClear = { encoded = emptyList() },
                showClear = entries.isNotEmpty()
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Running total hero
            Column(
                Modifier
                    .padding(Dimens.SpaceLg)
                    .fillMaxWidth()
                    .background(Gradients.Cyan, RoundedCornerShape(Dimens.RadiusSheet))
                    .padding(Dimens.SpaceXl),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "Running total",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSecondary
                )
                Text(
                    formatCurrency(total, "PHP", compact = true),
                    style = MaterialTheme.typography.displaySmall,
                    color = MaterialTheme.colorScheme.onSecondary
                )
                Text(
                    "${entries.size} ${if (entries.size == 1) "item" else "items"} · names optional",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSecondary
                )
            }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = Dimens.SpaceLg),
                verticalArrangement = Arrangement.spacedBy(Dimens.SpaceSm)
            ) {
                if (entries.isEmpty()) {
                    item {
                        Text(
                            "Add prices as you shop — no need to name anything. " +
                                "Your running total stays saved.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(Dimens.SpaceXl)
                        )
                    }
                }
                itemsIndexed(entries) { index, entry ->
                    TapeRow(
                        index = index + 1,
                        amount = entry.first,
                        name = entry.second,
                        onRemove = {
                            encoded = encoded.toMutableList().also { it.removeAt(index) }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun TapeRow(index: Int, amount: Double, name: String?, onRemove: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(Dimens.RadiusCard))
            .padding(horizontal = Dimens.SpaceLg, vertical = Dimens.SpaceMd),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            Modifier
                .size(26.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text("$index", style = MaterialTheme.typography.labelSmall)
        }
        Spacer(Modifier.width(Dimens.SpaceMd))
        Text(
            name ?: "Item",
            style = MaterialTheme.typography.bodyLarge,
            color = if (name == null) MaterialTheme.colorScheme.onSurfaceVariant
            else MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )
        Text(formatCurrency(amount, "PHP", compact = true), style = MaterialTheme.typography.titleMedium)
        IconButton(onClick = onRemove) {
            Icon(Icons.Filled.Close, contentDescription = "Remove entry")
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EntryBar(
    amountText: String,
    onAmountChange: (String) -> Unit,
    nameText: String,
    onNameChange: (String) -> Unit,
    canAdd: Boolean,
    onAdd: () -> Unit,
    onClear: () -> Unit,
    showClear: Boolean
) {
    Column(
        Modifier
            .fillMaxWidth()
            .padding(Dimens.SpaceLg),
        verticalArrangement = Arrangement.spacedBy(Dimens.SpaceMd)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(Dimens.SpaceMd),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = amountText,
                onValueChange = onAmountChange,
                placeholder = { Text("₱ 0.00") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
                modifier = Modifier.weight(1f)
            )
            IconButton(
                onClick = onAdd,
                enabled = canAdd,
                modifier = Modifier
                    .size(56.dp)
                    .background(Gradients.Cyan, RoundedCornerShape(Dimens.RadiusCard))
            ) {
                Icon(
                    Icons.Filled.Add,
                    contentDescription = "Add price",
                    tint = MaterialTheme.colorScheme.onSecondary
                )
            }
        }
        OutlinedTextField(
            value = nameText,
            onValueChange = onNameChange,
            placeholder = { Text("Item name (optional)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Tap + to stack",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (showClear) {
                TextButton(onClick = onClear) { Text("Clear all") }
            } else {
                Spacer(Modifier.height(Dimens.SpaceXs))
            }
        }
    }
}

private fun encodeEntry(amount: Double, name: String): String = "$amount|$name"

private fun decodeEntry(raw: String): Pair<Double, String?> {
    val sep = raw.indexOf('|')
    if (sep < 0) return (raw.toDoubleOrNull() ?: 0.0) to null
    val amount = raw.substring(0, sep).toDoubleOrNull() ?: 0.0
    val name = raw.substring(sep + 1)
    return amount to name.ifBlank { null }
}
