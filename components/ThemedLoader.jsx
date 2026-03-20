/**
 * A full-screen centered loading spinner, theme-aware.
 *
 * Renders a React Native <ActivityIndicator> centered inside a
 * full-height ThemedView so it fills whatever space it's placed in.
 * The spinner color matches the current theme's text color for
 * visibility in both light and dark modes.
 */

import { ActivityIndicator } from "react-native";
import ThemedView from "./ThemedView";
import {useTheme} from "../contexts/ThemeContext";

const ThemedLoader = () => {
    const { theme } = useTheme()

    return (
        <ThemedView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <ActivityIndicator size="large" color={theme.text} />
        </ThemedView>
    )
}

export default ThemedLoader;