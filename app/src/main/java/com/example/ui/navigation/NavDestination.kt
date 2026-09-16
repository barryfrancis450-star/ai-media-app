package com.example.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.Videocam
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Home : Screen("home", "Home", Icons.Filled.Home, Icons.Outlined.Home)
    object Image : Screen("image", "AI Image", Icons.Filled.Image, Icons.Outlined.Image)
    object Gallery : Screen("gallery", "Gallery", Icons.Filled.Collections, Icons.Outlined.Collections)
    object Video : Screen("video", "AI Video", Icons.Filled.Videocam, Icons.Outlined.Videocam)
    object Voice : Screen("voice", "AI Voice", Icons.Filled.Mic, Icons.Outlined.Mic)
}
