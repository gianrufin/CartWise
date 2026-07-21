package com.cartwise.app.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.cartwise.app.ui.screens.AddItemScreen
import com.cartwise.app.ui.screens.HomeScreen
import com.cartwise.app.ui.screens.ListDetailScreen
import com.cartwise.app.ui.screens.ListsScreen
import com.cartwise.app.ui.screens.ReportsScreen
import com.cartwise.app.ui.screens.SettingsScreen
import com.cartwise.app.ui.screens.ShoppingModeScreen
import com.cartwise.app.ui.screens.TripSummaryScreen
import com.cartwise.app.ui.screens.WelcomeScreen

object Routes {
    const val WELCOME = "welcome"
    const val HOME = "home"
    const val LISTS = "lists"
    const val REPORTS = "reports"
    const val SETTINGS = "settings"
    const val LIST_DETAIL = "list/{listId}"
    const val ADD_ITEM = "list/{listId}/add-item"
    const val SHOPPING_MODE = "list/{listId}/shopping"
    const val TRIP_SUMMARY = "trip/{tripId}"

    fun listDetail(listId: String) = "list/$listId"
    fun addItem(listId: String) = "list/$listId/add-item"
    fun shoppingMode(listId: String) = "list/$listId/shopping"
    fun tripSummary(tripId: String) = "trip/$tripId"
}

private data class BottomTab(val route: String, val label: String, val icon: ImageVector)

private val bottomTabs = listOf(
    BottomTab(Routes.HOME, "Home", Icons.Filled.Home),
    BottomTab(Routes.LISTS, "Lists", Icons.Filled.ShoppingCart),
    BottomTab(Routes.REPORTS, "Reports", Icons.Filled.BarChart),
    BottomTab(Routes.SETTINGS, "Settings", Icons.Filled.Settings)
)

@Composable
fun CartWiseApp(navController: NavHostController = rememberNavController()) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val showBottomBar = currentRoute in bottomTabs.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    bottomTabs.forEach { tab ->
                        NavigationBarItem(
                            selected = currentRoute == tab.route,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = tab.label) },
                            label = { Text(tab.label) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.WELCOME,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Routes.WELCOME) {
                WelcomeScreen(
                    onContinueAsGuest = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.WELCOME) { inclusive = true }
                        }
                    }
                )
            }
            composable(Routes.HOME) {
                HomeScreen(
                    onOpenList = { listId -> navController.navigate(Routes.listDetail(listId)) },
                    onOpenTrip = { tripId -> navController.navigate(Routes.tripSummary(tripId)) }
                )
            }
            composable(Routes.LISTS) {
                ListsScreen(
                    onOpenList = { listId -> navController.navigate(Routes.listDetail(listId)) }
                )
            }
            composable(Routes.REPORTS) { ReportsScreen() }
            composable(Routes.SETTINGS) { SettingsScreen() }
            composable(Routes.LIST_DETAIL) { entry ->
                val listId = entry.arguments?.getString("listId")
                ListDetailScreen(
                    listId = listId,
                    onBack = { navController.popBackStack() },
                    onAddItem = { navController.navigate(Routes.addItem(listId ?: "")) },
                    onStartShopping = { navController.navigate(Routes.shoppingMode(listId ?: "")) }
                )
            }
            composable(Routes.ADD_ITEM) { entry ->
                AddItemScreen(
                    listId = entry.arguments?.getString("listId"),
                    onBack = { navController.popBackStack() }
                )
            }
            composable(Routes.SHOPPING_MODE) { entry ->
                ShoppingModeScreen(
                    listId = entry.arguments?.getString("listId"),
                    onBack = { navController.popBackStack() },
                    onFinish = { navController.navigate(Routes.tripSummary("trip-1")) }
                )
            }
            composable(Routes.TRIP_SUMMARY) { entry ->
                TripSummaryScreen(
                    tripId = entry.arguments?.getString("tripId"),
                    onDone = {
                        navController.navigate(Routes.HOME) {
                            popUpTo(Routes.HOME) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
