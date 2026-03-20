/**
 * A theme-aware drop-in replacement for React Native's <View>.
 *
 * Automatically applies the correct background color for the current
 * light/dark color scheme. Accepts all standard <View> props via spread.
 *
 * Props:
 *  - safe {boolean} Default: false
 *      false → plain themed View, no safe area padding (use for inner layouts)
 *      true  → adds top/bottom padding equal to the device's safe area insets
 *               (use for root screen containers to avoid content going under
 *               the notch, status bar, or home indicator)
 *  - style — merged after background and safe area styles, so callers can override
 */

import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useTheme} from "../contexts/ThemeContext";

const ThemedView = ({ style, safe = false, ...props }) => {
    const { theme } = useTheme()

    // Always call the hook
    const insets = useSafeAreaInsets()

    if (!safe) return (
        <View
            style={[{ backgroundColor: theme.background }, style]}
            {...props}
        />
    )

    // safe=true: pad top and bottom to respect the device's safe area
    // (status bar / notch on top, home indicator on bottom)
    return (
        <View
            style={[{
                backgroundColor: theme.background,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            },
                style
            ]}
            {...props}
        />
    )
}

export default ThemedView;