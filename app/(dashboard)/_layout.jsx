import {Tabs, usePathname, useRouter} from "expo-router"
import { Colors } from "../../constants/Colors"
import { Ionicons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import ThemedHeader from "../../components/ThemedHeader";
import { useUser } from "../../hooks/useUser";
import ThemedView from "../../components/ThemedView";
import IncidentTypeModal from "../../components/modals/IncidentTypeModal";
import {useState, useEffect} from "react";
import OfflineBanner from "../../components/offline/OfflineBanner";
import * as NavigationBar from "expo-navigation-bar";

import { useIncidents } from "../../hooks/useIncidents";
import { useProximityAlerts } from "../../hooks/useProximityAlerts";
import ProximityAlertModal from "../../components/modals/ProximityAlertModal";
import LocationWakeup from "../../components/LocationWakeup";
import {useNotifications} from "../../hooks/useNotifications";
import { NotificationsProvider } from '../../contexts/NotificationsContext'
import {useTheme} from "../../contexts/ThemeContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function DashboardLayout() {
    const { colorScheme } = useTheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const [typeModalOpen, setTypeModalOpen] = useState(false)
    const [tabBarHeight, setTabBarHeight] = useState(60) // fallback until measured
    const router = useRouter()
    const pathname = usePathname()
    const { profile } = useUser()

    const { incidents } = useIncidents();
    const activeIncidents = incidents.filter(i => i.status === 'active' && i.latitude && i.longitude);
    const { sendProximityNotification, resetNotification } = useNotifications();
    const { activeAlert, dismissAlert } = useProximityAlerts(activeIncidents, sendProximityNotification, resetNotification);
    const insets = useSafeAreaInsets()

    // Measure actual tab bar height on layout
    const handleTabBarLayout = (event) => {
        const { height } = event.nativeEvent.layout
        setTabBarHeight(height)
    }

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

    // hide header/tabs when user is on preferences for the first time
    const isOnboarding = pathname === '/menu/preferences' && !profile?.preferences_completed
    return (
        <UserOnly>
            <NotificationsProvider>
            <ThemedView style={{ flex: 1 }}>
                <ThemedHeader />
                <OfflineBanner />
                <Tabs
                    safeAreaInsets={{ bottom: insets.bottom }}
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: isOnboarding ? { display: 'none' } : {
                            backgroundColor: theme.navBackground,
                            paddingBottom: insets.bottom,
                            height: tabBarHeight + insets.bottom,
                        },
                        tabBarActiveTintColor: theme.iconColorFocused,
                        tabBarInactiveTintColor: theme.iconColor,
                        tabBarItemStyle: {
                            borderTopWidth: 3,
                            paddingTop: 10,
                            borderTopColor: pathname === `/${route.name}` ? theme.iconColorFocused : 'transparent',
                        },
                    })}
                    onLayout={handleTabBarLayout}
                >
                    <Tabs.Screen
                        name="incidents"
                        options={{
                            title: "Incidents",
                            tabBarIcon: ({focused}) => (
                                <Ionicons
                                    size={30}
                                    name={focused ? 'list': 'list-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            ) }}
                    />
                    <Tabs.Screen
                        name="menu/resources"
                        options={{
                            title: "Resources",
                            tabBarItemStyle: {
                                borderTopWidth: 3,
                                paddingTop: 10,
                                borderTopColor: pathname === '/menu/resources' ? theme.iconColorFocused : 'transparent',
                            },
                            tabBarIcon: ({focused}) => (
                                <Ionicons name="medkit" size={30} color={focused ? theme.iconColorFocused : theme.iconColor} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="create"
                        options={{
                            title: "Report",
                            tabBarItemStyle: {
                                borderTopWidth: 3,
                                paddingTop: 10,
                                borderTopColor: pathname === '/create' ? theme.iconColorFocused : 'transparent',
                            },
                            tabBarIcon: ({focused}) => (
                                <Ionicons name="warning" size={30} color={focused ? theme.iconColorFocused : theme.iconColor} />
                            ),
                        }}
                        listeners={{
                            tabPress: (e) => {
                                e.preventDefault()
                                setTypeModalOpen(true)
                            },
                        }}
                    />
                    <Tabs.Screen
                        name="map"
                        options={{
                            title: "Map",
                            tabBarIcon: ({ focused }) => (
                                <Ionicons
                                    size={30}
                                    name={focused ? 'map' : 'map-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            )
                        }}
                    />


                    <Tabs.Screen
                        name="incidents/[id]"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="menu/preferences"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="menu/profile"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="menu/faq"
                        options={{ href: null }}
                    />

                    <Tabs.Screen
                        name="notifications"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="routes"
                        options={{ href: null }}
                    />
                </Tabs>
                <IncidentTypeModal
                    visible={typeModalOpen}
                    onClose={() => setTypeModalOpen(false)}
                    onSelect={(type) => {
                        setTypeModalOpen(false)
                        router.push({ pathname: '/create', params: { type } })
                    }}
                />
                <ProximityAlertModal
                    visible={!!activeAlert}
                    incident={activeAlert?.incident}
                    stage={activeAlert?.stage}
                    onClose={dismissAlert}
                />
                <LocationWakeup/>
            </ThemedView>
            </NotificationsProvider>
        </UserOnly>
    )
}
