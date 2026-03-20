/**
 *
 * A left-side slide-in navigation drawer, implemented as a full-screen Modal.
 *
 *  - Tapping the dark overlay (right of the drawer panel) calls onClose.
 *  - The inner drawer panel uses a nested TouchableWithoutFeedback to
 *    prevent taps from propagating to the overlay and accidentally closing it.
 *  - Each menu item calls onClose before navigating, so the drawer closes
 *    as the new screen slides in.
 *
 * Props:
 *  - visible {boolean}  — Controls modal visibility.
 *  - onClose {function} — Called to close the drawer (sets drawerOpen=false in ThemedHeader).
 *
 * Used in: components/ThemedHeader.jsx
 *
 * Note: The `drawer` style in the StyleSheet (width: 280) is unused — the
 * drawer width is hardcoded inline as 300. These should be consolidated.
 *
 * TODO (Goal 1): Show the user's display name / student ID here once the profile table is populated, instead of just the email.
 * TODO (Goal 9): Add a quick-toggle for "Do Not Disturb" mode in the drawer.
 */

import {
    Modal,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
} from 'react-native'
import { Colors } from "../../constants/Colors";
import ThemedText from "../ThemedText";
import { useUser } from "../../hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import ThemedMenuItem from "../ThemedMenuItem";
import { useRouter } from "expo-router";
import {useTheme} from "../../contexts/ThemeContext";

const ThemedDrawer = ({ visible, onClose }) => {
    const { theme } = useTheme()

    // user.email is displayed and used to derive the avatar initial
    const { user, logout } = useUser()
    const router = useRouter()

    /**
     * handleLogout
     * Closes the drawer first (so the UI feels responsive), then signs out.
     * Signing out triggers UserOnly to redirect to /login automatically.
     */
    async function handleLogout() {
        onClose()
        await logout()
    }

    /**
     * navigate(path)
     * Closes the drawer then pushes the new route. Closing first means
     * the drawer dismiss animation doesn't compete with the screen transition.
     */
    function navigate(path) {
        onClose()
        router.push(path)
    }

    return (
        // No animationType set — drawer appears instantly.
        // TODO: Add animationType="slide" for a smoother open/close feel.
        <Modal visible={visible} transparent>

            {/* Full-screen overlay — tapping the dark area closes the drawer */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: Colors.overlay }}>

                    {/* Drawer panel — stops tap propagation so it doesn't close on self-tap */}
                    <TouchableWithoutFeedback>
                        <View style={{ width: 300, height: '100%', backgroundColor: theme.navBackground }}>

                            <View style={styles.userSection}>
                                {/* Avatar circle — shows first letter of user's email */}
                                <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                                    <ThemedText style={styles.avatarText}>
                                        {user?.email?.[0].toUpperCase()}
                                    </ThemedText>
                                </View>

                                {/* Email — truncated to 1 line if too long */}
                                <ThemedText style={styles.email} numberOfLines={1}>
                                    {user?.email}
                                </ThemedText>

                                {/* Divider — ⚠️ currently invisible because height is not set in the style */}
                                <View style={styles.divider} />

                                {/* Navigation items */}
                                <ThemedMenuItem onPress={() => navigate('menu/profile')}>
                                    <Ionicons name="person-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Profile</ThemedText>
                                </ThemedMenuItem>

                                <ThemedMenuItem onPress={() => navigate('menu/preferences')}>
                                    <Ionicons name="options-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Preferences</ThemedText>
                                </ThemedMenuItem>

                                <ThemedMenuItem onPress={() => navigate('menu/resources')}>
                                    <Ionicons name="medkit-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Emergency Resources</ThemedText>
                                </ThemedMenuItem>

                                {/* Logout styled in warning color to signal destructive action */}
                                <ThemedMenuItem onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={22} color={Colors.warning} />
                                    <ThemedText style={{ color: Colors.warning, fontSize: 16 }}>Logout</ThemedText>
                                </ThemedMenuItem>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default ThemedDrawer

const styles = StyleSheet.create({
    drawer: {
        width: 280,         // ⚠️ unused — width is hardcoded inline as 300 above
        height: '100%',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    userSection: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        opacity: 0.7,
    },
    divider: {
        backgroundColor: Colors.divider,
        marginVertical: 10,
        height: 1
    }
})