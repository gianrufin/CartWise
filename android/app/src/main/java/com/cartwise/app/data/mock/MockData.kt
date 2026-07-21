package com.cartwise.app.data.mock

import com.cartwise.app.data.model.CompletedTrip
import com.cartwise.app.data.model.ItemPriority
import com.cartwise.app.data.model.ItemStatus
import com.cartwise.app.data.model.ListItem
import com.cartwise.app.data.model.PaymentMethod
import com.cartwise.app.data.model.ShoppingList
import java.text.NumberFormat
import java.util.Locale

// Phase 0 mock data. Replaced by Room-backed local storage in Phase 1.
object MockData {

    val defaultCategories = listOf(
        "Produce", "Meat and Seafood", "Dairy", "Pantry", "Snacks", "Beverages",
        "Household", "Personal Care", "Baby and Kids", "Pets", "Pharmacy", "Other"
    )

    val defaultStores = listOf(
        "SM Supermarket", "Wet Market", "Mercury Drug", "Bakery", "Sari-sari Store", "Other"
    )

    val defaultUnits = listOf("pc", "kg", "g", "L", "mL", "pack", "tray", "dozen", "sack")

    val weeklyGroceries = ShoppingList(
        id = "list-1",
        name = "Weekly Groceries",
        description = "Regular weekly run",
        currency = "PHP",
        budgetAmount = 3000.0,
        items = listOf(
            ListItem(
                id = "item-1", listId = "list-1", name = "Rice",
                quantity = 5.0, unit = "kg",
                estimatedUnitPrice = 70.0, estimatedTotalPrice = 350.0,
                actualTotalPrice = 370.0,
                category = "Pantry", store = "SM Supermarket",
                priority = ItemPriority.ESSENTIAL, status = ItemStatus.PURCHASED
            ),
            ListItem(
                id = "item-2", listId = "list-1", name = "Eggs",
                quantity = 1.0, unit = "tray",
                estimatedTotalPrice = 240.0, actualTotalPrice = 250.0,
                category = "Dairy", store = "SM Supermarket",
                priority = ItemPriority.ESSENTIAL, status = ItemStatus.PURCHASED
            ),
            ListItem(
                id = "item-3", listId = "list-1", name = "Chicken",
                quantity = 1.0, unit = "kg",
                estimatedTotalPrice = 220.0,
                category = "Meat and Seafood", store = "Wet Market",
                priority = ItemPriority.ESSENTIAL, status = ItemStatus.UNAVAILABLE
            ),
            ListItem(
                id = "item-4", listId = "list-1", name = "Bananas",
                quantity = 1.0, unit = "kg",
                estimatedTotalPrice = 90.0,
                category = "Produce", store = "Wet Market",
                status = ItemStatus.PENDING
            ),
            ListItem(
                id = "item-5", listId = "list-1", name = "Dish soap",
                notes = "Any brand on promo",
                quantity = 1.0, unit = "pc",
                estimatedTotalPrice = 65.0,
                category = "Household", store = "SM Supermarket",
                priority = ItemPriority.OPTIONAL, status = ItemStatus.PENDING
            ),
            ListItem(
                id = "item-6", listId = "list-1", name = "Instant coffee",
                quantity = 2.0, unit = "pack",
                estimatedUnitPrice = 55.0, estimatedTotalPrice = 110.0,
                category = "Beverages", store = "Sari-sari Store",
                status = ItemStatus.CARRIED_OVER
            )
        )
    )

    val birthdayParty = ShoppingList(
        id = "list-2",
        name = "Birthday Party",
        description = "For Saturday",
        currency = "PHP",
        budgetAmount = 1500.0,
        items = listOf(
            ListItem(
                id = "item-7", listId = "list-2", name = "Spaghetti pasta",
                quantity = 2.0, unit = "pack", estimatedUnitPrice = 60.0,
                estimatedTotalPrice = 120.0, category = "Pantry",
                store = "SM Supermarket", status = ItemStatus.PENDING
            ),
            ListItem(
                id = "item-8", listId = "list-2", name = "Cake",
                quantity = 1.0, unit = "pc", estimatedTotalPrice = 600.0,
                category = "Snacks", store = "Bakery",
                priority = ItemPriority.ESSENTIAL, status = ItemStatus.PENDING
            )
        )
    )

    val lists = listOf(weeklyGroceries, birthdayParty)

    fun listById(id: String?): ShoppingList = lists.firstOrNull { it.id == id } ?: weeklyGroceries

    val completedTrips = listOf(
        CompletedTrip(
            id = "trip-1",
            listName = "Weekly Groceries",
            budgetAmount = 3000.0,
            actualTotal = 620.0,
            paymentMethod = PaymentMethod.CASH,
            completedAtLabel = "Jul 18, 2026",
            purchasedCount = 2, unavailableCount = 1, skippedCount = 0, carriedOverCount = 1
        ),
        CompletedTrip(
            id = "trip-2",
            listName = "Pantry Restock",
            budgetAmount = 2000.0,
            actualTotal = 2180.0,
            paymentMethod = PaymentMethod.GCASH,
            completedAtLabel = "Jul 11, 2026",
            purchasedCount = 12, unavailableCount = 0, skippedCount = 2, carriedOverCount = 0
        )
    )

    val monthSpendingTotal: Double = completedTrips.sumOf { it.actualTotal }
}

// PHP-first currency formatting per docs/design-tokens.md.
fun formatCurrency(amount: Double, currency: String = "PHP", compact: Boolean = false): String {
    val symbol = when (currency) {
        "PHP" -> "₱"
        "USD" -> "$"
        else -> "$currency "
    }
    val format = NumberFormat.getNumberInstance(Locale.US).apply {
        val wholeNumber = amount % 1.0 == 0.0
        minimumFractionDigits = if (compact && wholeNumber) 0 else 2
        maximumFractionDigits = if (compact && wholeNumber) 0 else 2
    }
    return symbol + format.format(amount)
}
