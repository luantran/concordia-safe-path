/**
 * A theme-aware pressable row used as a navigation item inside the
 * side drawer (ThemedDrawer.jsx).
 *
 * Renders a horizontally laid-out touchable row with a card-like
 * background. Dims to 70% opacity on press for tactile feedback.
 *
 * Props:
 *  - onPress {function} — Called when the row is tapped.
 *  - style   — Merged into the Pressable style (overrides card defaults).
 *  - ...props — All other Pressable props, including children.
 *               Children are typically an <Ionicons> icon + <ThemedText> label.
 */

import { Pressable, StyleSheet } from "react-native";
import {useTheme} from "../contexts/ThemeContext";

const ThemedMenuItem = ({ onPress, style, ...props }) => {
    const { theme } = useTheme()

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.uiBackground, opacity: pressed ? 0.7 : 1 },
                style
            ]}
            onPress={onPress}
            {...props}
        />
    )
}

export default ThemedMenuItem;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',       // Icon + label side by side
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 10,
        marginVertical: 4,
        marginHorizontal: 16,
        alignSelf: 'stretch',       // Fills the full drawer width
    },
})