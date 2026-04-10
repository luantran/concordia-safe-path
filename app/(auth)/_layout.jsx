/**
 * Layout wrapper for all authentication screens (login, register).
 *
 *  - Wraps auth screens in <GuestOnly>,  redirects already-logged-in
 *    users away to the dashboard before they ever see this layout.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import GuestOnly from "../../components/auth/GuestOnly";
import {useEffect} from "react";
import * as NavigationBar from "expo-navigation-bar";
import {Colors} from "../../constants/Colors";
import {useTheme} from "../../contexts/ThemeContext";

const AuthLayout = () => {
    const { colorScheme } = useTheme()
    const theme = Colors[colorScheme] ?? Colors.light
    // Configure system navigation bar to match theme
    useEffect(() => {
        if (NavigationBar) {
            try {
                // Set navigation bar background color to match tab bar
                NavigationBar.setBackgroundColorAsync(theme.navBackground)
                // Try to enable light icons if theme is dark, otherwise use dark icons
                if (colorScheme === 'dark') {
                    NavigationBar.setButtonStyleAsync('light')
                } else {
                    NavigationBar.setButtonStyleAsync('dark')
                }
            } catch (error) {
                // NavigationBar API not available on all platforms (e.g., iOS)
                console.log('NavigationBar configuration not available')
            }
        }
    }, [theme, colorScheme])
    return (
        // GuestOnly redirects authenticated users to /incidents.
        <GuestOnly>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerShown: false,  // No nav header on any auth screen
                    animation: "none",   // Instant transition between login and register
                }}
            />
        </GuestOnly>
    )
}

export default AuthLayout;