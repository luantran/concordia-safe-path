/**
 * The persistent top navigation bar rendered on every dashboard screen.
 *
 * Layout (left to right):Hamburger button - Page Title - Notifications button
 *
 *  - Reads the current route pathname and maps it to a human-readable title
 *    via PAGE_TITLES. Falls back to "Incident Detail" for dynamic routes
 *    like /incidents/[id], and empty string for any unmapped path.
 *  - Opens the side drawer (ThemedDrawer) when the menu icon is tapped.
 *  - Navigates to /notifications when the bell icon is tapped.
 *  - Accounts for the device's top safe area inset (notch/status bar) via
 *    useSafeAreaInsets, so content isn't hidden behind the status bar.
 *
 * TODO (Goal 2): MAYBE Add an emergency alert banner that can appear below this header when an active high-severity incident is nearby.
 * TODO (Goal 10): The notifications icon could show a badge count?
 */

import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedDrawer from './modals/ThemedDrawer'
import { useState } from "react";
import { usePathname, useRouter } from "expo-router";
import ThemedText from "./ThemedText";
import {useTheme} from "../contexts/ThemeContext";

// Maps route pathnames to display titles shown in the header center.
// Dynamic routes are handled separately below.
const PAGE_TITLES = {
    '/incidents': 'Incidents',
    '/map': 'Campus Map',
    '/profile': 'Profile',
    '/notifications': 'Notifications',
    '/create': 'Report Incident',
    '/menu/preferences': 'Preferences',
    '/menu/resources': 'Emergency Resources',
    '/menu/profile': 'Profile',
    '/routes': 'Safe Routes',
}

const ThemedHeader = () => {
    const { theme } = useTheme()
    const insets = useSafeAreaInsets()

    // drawerOpen controls the visibility of the side navigation drawer
    const [drawerOpen, setDrawerOpen] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    // Look up the title for the current path, with a fallback for
    // dynamic incident detail routes (/incidents/[id])
    const title = PAGE_TITLES[pathname] ??
        (pathname.startsWith('/incidents/') ? 'Incident Detail' : '');

    return (
        <View style={[
            styles.header,
            {
                backgroundColor: theme.navBackground,
                paddingTop: insets.top + 15, // push content below the status bar/notch
                paddingBottom: 15,
            }
        ]}>
            {/* Left: hamburger menu → opens ThemedDrawer */}
            <TouchableOpacity onPress={() => setDrawerOpen(true)}>
                <Ionicons name="menu" size={26} color={theme.title} />
            </TouchableOpacity>

            {/* ThemedDrawer is always mounted; visibility controlled by `visible` prop */}
            <ThemedDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Center: current page title */}
            <ThemedText title={true} style={styles.headerTitle}>{title}</ThemedText>

            {/* Right: notifications icon → navigates to /notifications */}
            <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={26} color={theme.title} />
            </TouchableOpacity>
        </View>
    )
}

export default ThemedHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
})