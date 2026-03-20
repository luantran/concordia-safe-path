/**
 * A theme-aware custom dropdown/select component built with a Modal overlay.
 *
 * React Native has no native <select> element, so this simulates one:
 * tapping the selector opens a centered modal with a scrollable option list.
 * Tapping an option selects it and closes the modal. Tapping outside the
 * list (on the overlay) also closes it without selecting.
 *
 * Props:
 *  - value       {string}   — The currently selected option value (controlled).
 *  - options     {Array}    — List of { label: string, value: string } objects.
 *  - onSelect    {function} — Called with the selected value when an option is tapped.
 *  - placeholder {string}   — Text shown when no value is selected. Default: "Select an option"
 *  - style       — Applied to the selector trigger (the closed state button).

 *
 * TODO: This component is defined but not currently used in any screen, leftover from rpevious iteration of create.jsx
 */

import { useState } from 'react'
import { StyleSheet, Pressable, FlatList, Modal } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedText from './ThemedText'
import ThemedView from './ThemedView'
import {useTheme} from "../contexts/ThemeContext";

const ThemedDropdown = ({ value, options, onSelect, placeholder = "Select an option", style }) => {
    // Controls whether the modal list is visible
    const [open, setOpen] = useState(false)

    const { theme } = useTheme()

    return (
        <>
            {/* The "closed" trigger button — shows current value or placeholder */}
            <Pressable
                style={[{ backgroundColor: theme.uiBackground }, styles.selector, style]}
                onPress={() => setOpen(true)}
            >
                {/* Dim the placeholder text when no value is selected */}
                <ThemedText style={value ? {} : styles.placeholder}>
                    {value || placeholder}
                </ThemedText>
                <ThemedText>▾</ThemedText>
            </Pressable>

            {/* Full-screen modal overlay — tap outside the list to dismiss */}
            <Modal visible={open} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    {/* ThemedView here gives the list the correct background for light/dark */}
                    <ThemedView style={styles.dropdown}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.option,
                                        // Highlight the currently selected option
                                        value === item.value && { backgroundColor: Colors.primary + '33' } // '33' = 20% opacity
                                    ]}
                                    onPress={() => {
                                        onSelect(item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <ThemedText>{item.label}</ThemedText>
                                </Pressable>
                            )}
                        />
                    </ThemedView>
                </Pressable>
            </Modal>
        </>
    )
}

export default ThemedDropdown

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 6,
    },
    placeholder: {
        opacity: 0.4,
    },
    // Semi-transparent dark overlay behind the dropdown list
    overlay: {
        flex: 1,
        backgroundColor: '#00000066', // 40% black
        justifyContent: 'center',
        padding: 40,
    },
    dropdown: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    option: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff22', // subtle divider between options
    },
})