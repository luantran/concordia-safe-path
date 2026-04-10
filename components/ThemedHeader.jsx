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

import { TouchableOpacity, View, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThemedDrawer from './modals/ThemedDrawer'
import { useState } from "react";
import { usePathname, useRouter } from "expo-router";
import ThemedText from "./ThemedText";
import { useNotificationsContext } from "../contexts/NotificationsContext"
import {useUser} from "../hooks/useUser";
import {useTheme} from "../contexts/ThemeContext";
import {getBackOverride} from "../lib/navigationStore";

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
    '/menu/faq': 'FAQs',
    '/routes': 'Safe Routes',
}

const ThemedHeader = () => {
    const { colorScheme } = useTheme()
    const insets = useSafeAreaInsets()

    // drawerOpen controls the visibility of the side navigation drawer
    const [drawerOpen, setDrawerOpen] = useState(false)

    const theme = Colors[colorScheme] ?? Colors.light
    const router = useRouter()
    const pathname = usePathname()
    const { unreadCount } = useNotificationsContext()

    // Look up the title for the current path, with a fallback for
    // dynamic incident detail routes (/incidents/[id])
    const title = PAGE_TITLES[pathname] ??
        (pathname.startsWith('/incidents/') ? 'Incident Detail' : '');

    const { profile } = useUser()
    const isOnboarding = pathname === '/menu/preferences' && !profile?.preferences_completed

    return (
        <View style={[
            styles.header,
            {
                backgroundColor: Colors.primaryDark,
                paddingTop: insets.top + 15, // push content below the status bar/notch
                paddingBottom: 15,
            }
        ]}>
            {/* Left: hamburger menu → opens ThemedDrawer */}
            {pathname.startsWith('/menu/') || pathname.startsWith('/incidents/') ? (
                !isOnboarding && (
                    <TouchableOpacity onPress={() => {
                        const override = getBackOverride()
                        if (override) {
                            override()
                        } else {
                            router.back()
                        }
                    }}>
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                )
            ) : (
                <TouchableOpacity onPress={() => setDrawerOpen(true)}>
                    <Ionicons name="menu" size={26} color="#fff" />
                </TouchableOpacity>
            )}

            {/* ThemedDrawer is always mounted; visibility controlled by `visible` prop */}
            <ThemedDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Center: current page title */}
            <ThemedText title={true} style={styles.headerTitle}>{title}</ThemedText>

            {/* Right: notifications icon → navigates to /notifications */}
            <TouchableOpacity 
                onPress={() => router.push('/notifications')} 
                    style={styles.bellContainer}
>
                <Ionicons
                    name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
                    size={26}
                    color="#fff"
                />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {String(unreadCount > 9 ? '9+' : unreadCount)}
                        </Text>
                    </View>
                )}
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
        color: '#fff',
    },
    bellContainer: {
    position: 'relative',
    width: 36,      // ← increase from 32
    height: 36,     // ← add height
    alignItems: 'center',
    justifyContent: 'center',  // ← add this
},
    badge: {
    position: 'absolute',
    top: -4,
    right: -8,  // ← adjust from -4
    backgroundColor: Colors.warning,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
},
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
})