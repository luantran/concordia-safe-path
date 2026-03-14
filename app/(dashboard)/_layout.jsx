import {Tabs, usePathname, useRouter} from "expo-router"
import {TouchableOpacity, useColorScheme, StyleSheet } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import ThemedHeader from "../../components/ThemedHeader";
import { useUser } from "../../hooks/useUser";
import ThemedView from "../../components/ThemedView";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import IncidentTypeModal from "../../components/modals/IncidentTypeModal";
import {useState} from "react";
import OfflineBanner from "../../components/offline/OfflineBanner";
const TAB_BAR_PADDING_TOP = 10
export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const [typeModalOpen, setTypeModalOpen] = useState(false)
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const pathname = usePathname()
    const { profile } = useUser()
    // hide header/tabs when user is on preferences for the first time
    const isOnboarding = pathname === '/menu/preferences' && !profile?.preferences_completed
    // hide the global hamburger header on pages that have their own custom header
    const hideHeader = isOnboarding || pathname === '/menu/resources' || pathname === '/menu/preferences'
    return (
        <UserOnly>
            <ThemedView style={{ flex: 1 }}>
                {!hideHeader && <ThemedHeader />}
                <OfflineBanner />
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        // tabBarStyle: { backgroundColor: 'blue', paddingTop: TAB_BAR_PADDING_TOP, height: insets.bottom + 65},                        
                        tabBarStyle: isOnboarding ? { display: 'none' } : { backgroundColor: theme.navBackground, paddingTop: 10, height: 100 },
                        tabBarActiveTintColor: theme.iconColorFocused,
                        tabBarInactiveTintColor: theme.iconColor,
                    }}
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
                        name="create"
                        options={{ href: null }}
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
                        name="menu/resources"
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
                {!isOnboarding && pathname !== '/create' && (
                    <TouchableOpacity
                        style={styles.emergencyFab}
                        onPress={() => router.push('/menu/resources')}
                    >
                        <Ionicons name="medkit-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                )}
                {!isOnboarding && pathname !== '/create' && (
                    <TouchableOpacity
                        style={[styles.createFab, ]}
                        onPress={() => setTypeModalOpen(true)}
                    >
                        <Ionicons name="warning" size={30} color={Colors.attention} />
                    </TouchableOpacity>
                )}
            </ThemedView>
        </UserOnly>
    )
}
const styles = StyleSheet.create({
    emergencyFab: {
        position: 'absolute',
        bottom: 120, // sits above the tab bar
        right: 30,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    createFab: {
        position: 'absolute',
        bottom: 210,
        right: 30,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
})