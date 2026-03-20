/**
 * A persistent emergency action button anchored to the bottom center of
 * the screen, above the tab bar. Tapping it opens a radial action menu
 * with three quick-access safety actions.
 *
 * Closed state:
 *  A semi-circular button (flat bottom, rounded top) with a warning icon,
 *  sitting flush against the top of the tab bar.
 *
 * Open state:
 *  A full-screen transparent Modal with a dark overlay appears.
 *  Three circular action buttons arc above the trigger:
 *    Left   → Safe Route Now  → navigates to /routes
 *    Center → Emergency       → navigates to /menu/resources
 *    Right  → Safe Walk       → (not yet implemented)
 *  Tapping anywhere on the overlay (outside the buttons) closes the dial.
 *
 * Props:
 *  - paddingTop {number} Default: 0
 *    Vertical offset passed in from the dashboard layout to align the
 *    button correctly above the tab bar's paddingTop.
 *
 * Layout note:
 *  The `bottom` positioning of the action buttons uses:
 *    insets.bottom - paddingTop + 20
 *  This anchors them relative to the device's bottom safe area so they
 *  sit consistently above the tab bar across different device sizes.
 *
 * TODO (Goal 2): Add haptic feedback when the dial opens (Goal 2 — emergency UX)
 * TODO (Goal 2): Add a "Safe Zone Now" one-tap button as a dedicated action
 * TODO (Goal 12): Wire the right "Safe Walk" button to the share-location flow
 */

import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import {useTheme} from "../../contexts/ThemeContext";

const SpeedDial = ({ paddingTop = 0 }) => {
    const { theme } = useTheme()

    // insets.bottom = height of the home indicator / bottom safe area
    const insets = useSafeAreaInsets()

    // Controls whether the radial action menu is visible
    const [open, setOpen] = useState(false)

    const router = useRouter()

    /** Navigates to the emergency resources page (Goal 10) */
    function handleEmergency() {
        setOpen(false)
        router.push('/menu/resources')
    }

    /** Navigates to the safe routes screen (Goal 8) */
    function safeRouteNow() {
        setOpen(false)
        router.push('/routes')
    }

    return (
        <>
            {/* Modal is only mounted when open=true to avoid invisible overlay
                intercepting touches when the dial is closed */}
            <Modal visible={open} transparent animationType="fade">

                {/* Full-screen tap-to-dismiss overlay */}
                <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                {/* Three action buttons arcing above the trigger button.
                    Each has a different marginBottom to create the arc effect:
                    the center button is highest, the two sides are lower. */}
                <View style={[styles.actionsContainer, { bottom: insets.bottom - paddingTop + 20 }]}>

                    {/* Left: Safe Route Now */}
                    <TouchableOpacity
                        style={[styles.actionButton, { marginBottom: 15 }]}
                        onPress={safeRouteNow}
                    >
                        <Ionicons name="navigate-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    {/* Center: Emergency Resources (highest in the arc) */}
                    <TouchableOpacity
                        style={[styles.actionButton, { marginBottom: 65 }]}
                        onPress={handleEmergency}
                    >
                        <Ionicons name="alert-circle-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    {/* Right: Safe Walk — TODO: implement Goal 12 (share location) */}
                    <TouchableOpacity
                        style={[styles.actionButton, { marginBottom: 15 }]}
                        // onPress not yet wired up
                    >
                        <Ionicons name="people-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                </View>
            </Modal>

            {/* The trigger button — always visible above the tab bar */}
            <View style={[styles.container, { bottom: insets.bottom - paddingTop }]}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: Colors.primary }]}
                    onPress={() => setOpen(!open)}
                >
                    <Ionicons name="warning" size={26} color="#fff" />
                </TouchableOpacity>
            </View>
        </>
    )
}

export default SpeedDial

const styles = StyleSheet.create({
    // Positions the trigger button centered at the bottom of the screen
    container: {
        position: 'absolute',
        alignSelf: 'center',
    },
    // Semi-circular pill shape — flat top, rounded bottom
    button: {
        width: 80,
        height: 100,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    // Full-screen dark overlay behind the action buttons
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
    },
    // Row of action buttons — centered, anchored to the bottom
    actionsContainer: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 25,
        alignItems: 'flex-end', // different marginBottoms create the arc effect
    },
    actionButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
})