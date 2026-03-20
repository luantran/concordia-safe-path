/**
 * A theme-aware drop-in replacement for React Native's <Text>.
 *
 * Automatically applies the correct text color for the current light/dark
 * color scheme. Accepts all standard <Text> props via spread.
 *
 * Props:
 *  - title {boolean} Default: false
 *      false → uses theme.text  (standard body text color)
 *      true  → uses theme.title (typically brighter/bolder, used for headers)
 *  - style — merged after the color, so callers can override if needed
 */

import { Text } from "react-native";
import { Colors } from '../constants/Colors'
import {useTheme} from "../contexts/ThemeContext";

const ThemedText = ({ style, title = false, ...props }) => {
    const { theme } = useTheme()

    // title=true uses a typically lighter/highlighted color for headings;
    // title=false uses the standard readable body text color
    const textColor = title ? theme.title : theme.text

    return (
        <Text
            style={[{ color: textColor }, style]}
            {...props}
        />
    )
}

export default ThemedText