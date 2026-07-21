package com.cartwise.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.cartwise.app.ui.theme.Dimens

@Composable
fun WelcomeScreen(onContinueAsGuest: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(Dimens.SpaceXl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Filled.ShoppingCart,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(Modifier.height(Dimens.SpaceLg))
        Text("CartWise", style = MaterialTheme.typography.displaySmall)
        Spacer(Modifier.height(Dimens.SpaceSm))
        Text(
            "Plan together, shop live, and stay within budget.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(Dimens.SpaceXxl))
        Button(
            onClick = onContinueAsGuest,
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.TouchTarget)
        ) {
            Text("Continue as guest")
        }
        Spacer(Modifier.height(Dimens.SpaceMd))
        // Account flows arrive in Phase 3; guest mode is the only working path for now.
        OutlinedButton(
            onClick = onContinueAsGuest,
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.TouchTarget)
        ) {
            Text("Create account")
        }
        TextButton(onClick = onContinueAsGuest) {
            Text("Sign in")
        }
    }
}
