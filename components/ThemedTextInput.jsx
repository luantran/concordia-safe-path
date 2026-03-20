/**
 * A theme-aware text input with built-in show/hide toggle for password fields.
 *
 *  Renders in two modes depending on the `secureTextEntry` prop:
 *
 *  1. Regular input (secureTextEntry = false/undefined):
 *     Returns a plain <TextInput> with theme colors applied.
 *
 *  2. Password input (secureTextEntry = true):
 *     Returns a <View> wrapping the input + an eye icon toggle button.
 *     The icon toggles between 'eye' and 'eye-off' to show/hide the text.
 *
 * * Props:
 *  *  - secureTextEntry {boolean} — Activates password mode with the eye toggle.
 *  *  - icon {string} — Optional Ionicons name to show inside the left of the field.
 *  *  - style — Applied to the outer container View in both regular and password mode.
 *  *            (not directly to the TextInput — use this for width, margin, etc.)
 *  *  - ...props — All other TextInput props (placeholder, value, onChangeText, etc.)
 *
 * TODO (Goal 13): Ensure this component is accessible — verify that the show/hide toggle button has an accessible label for screen readers.
 */

import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {useTheme} from "../contexts/ThemeContext";

const ThemedTextInput = ({ style, secureTextEntry, icon, ...props }) => {
    const { theme } = useTheme()
    // controls wether password chars are visible or masked
    const [hidden, setHidden] = useState(true);

    // shared input element used in password mode
    const input = (
        <TextInput
            placeholderTextColor={theme.text}
            secureTextEntry={secureTextEntry && hidden} // only mask when hidden=true
            autoCapitalize="none"
            style={{
                flex: 1, // fills row, leaving room for left icon + eye toggle
                backgroundColor: 'transparent',
                color: theme.text,
                padding: 14,
                borderRadius: 6,
            }}
            {...props}
        />
    );

    // regular input — return early, no eye toggle needed
    if (!secureTextEntry) return (
        <View style={[{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.uiBackground,
            borderRadius: 6,
            paddingHorizontal: 12,
        }, style]}>
            {/* optional left icon */}
            {icon && (
                <Ionicons name={icon} size={18} color={theme.iconColor} style={{ marginRight: 8 }} />
            )}
            <TextInput
                placeholderTextColor={theme.text}
                style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: theme.text,
                    padding: 14,
                    borderRadius: 6,
                }}
                {...props}
            />
        </View>
    );

    // password input — input + eye toggle share the same row container
    // outer View gives them a unified background/border so it looks like one field
    return (
        <View style={[{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.uiBackground,
            borderRadius: 6,
            paddingHorizontal: 12,
        }, style]}>
            {/* optional left icon */}
            {icon && (
                <Ionicons name={icon} size={18} color={theme.iconColor} style={{ marginRight: 8 }} />
            )}
            {input}
            {/* toggles password visibility */}
            <TouchableOpacity
                onPress={() => setHidden(prev => !prev)}
                style={{ paddingLeft: 8 }}
                // TODO (Goal 13): add accessibilityLabel="Show password" / "Hide password"
            >
                <Ionicons
                    name={hidden ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.text}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ThemedTextInput;