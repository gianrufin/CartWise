package com.cartwise.app.data.model

// Phase 0 UI models. Field names track docs/backend/schema-plan.sql so the
// Room entities (Phase 1) and Supabase tables (Phase 3) line up with the UI.

enum class ItemStatus(val label: String) {
    PENDING("Pending"),
    PURCHASED("Purchased"),
    UNAVAILABLE("Unavailable"),
    SKIPPED("Skipped"),
    CARRIED_OVER("Carried over")
}

enum class ItemPriority(val label: String) {
    ESSENTIAL("Essential"),
    NORMAL("Normal"),
    OPTIONAL("Optional")
}

enum class PaymentMethod(val label: String) {
    CASH("Cash"),
    GCASH("GCash"),
    MAYA("Maya"),
    DEBIT_CARD("Debit card"),
    CREDIT_CARD("Credit card"),
    BANK_TRANSFER("Bank transfer"),
    VOUCHER("Voucher"),
    OTHER("Other")
}

data class ListItem(
    val id: String,
    val listId: String,
    val name: String,
    val notes: String? = null,
    val quantity: Double = 1.0,
    val unit: String? = null,
    val estimatedUnitPrice: Double? = null,
    val estimatedTotalPrice: Double? = null,
    val actualUnitPrice: Double? = null,
    val actualTotalPrice: Double? = null,
    val category: String? = null,
    val store: String? = null,
    val priority: ItemPriority = ItemPriority.NORMAL,
    val status: ItemStatus = ItemStatus.PENDING
) {
    val isResolved: Boolean get() = status != ItemStatus.PENDING
}

data class ShoppingList(
    val id: String,
    val name: String,
    val description: String? = null,
    val currency: String = "PHP",
    val budgetAmount: Double? = null,
    val items: List<ListItem> = emptyList()
) {
    val estimatedTotal: Double
        get() = items
            .filter { it.status != ItemStatus.SKIPPED && it.status != ItemStatus.UNAVAILABLE }
            .sumOf { it.estimatedTotalPrice ?: 0.0 }

    // Only purchased items count as actual spending.
    val actualTotal: Double
        get() = items
            .filter { it.status == ItemStatus.PURCHASED }
            .sumOf { it.actualTotalPrice ?: 0.0 }

    val resolvedCount: Int get() = items.count { it.isResolved }
    val unresolvedCount: Int get() = items.count { !it.isResolved }
}

data class CompletedTrip(
    val id: String,
    val listName: String,
    val currency: String = "PHP",
    val budgetAmount: Double?,
    val actualTotal: Double,
    val paymentMethod: PaymentMethod,
    val completedAtLabel: String,
    val purchasedCount: Int,
    val unavailableCount: Int,
    val skippedCount: Int,
    val carriedOverCount: Int
)
