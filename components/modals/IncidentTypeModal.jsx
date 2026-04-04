/**
 * A bottom-sheet style modal for selecting an incident type before reporting.
 *
 * Renders a 2-column grid of icon + label tiles, one per incident type
 * defined in constants/Icons.js (INCIDENT_TYPES). Tapping a tile calls
 * onSelect with the type value and the parent is responsible for closing
 * the modal.
 *
 * Props:
 *  - visible  {boolean}  — Controls modal visibility (controlled component).
 *  - onClose  {function} — Called when the user dismisses without selecting.
 *  - onSelect {function} — Called with the selected type string (e.g. 'protest').
 *
 * TODO (Goal 7): Add accessibility labels to each tile for screen readers.
 */

import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedText from './../ThemedText'
import { INCIDENT_TYPES, IncidentIconMap } from "../../constants/Icons";
import {useTheme} from "../../contexts/ThemeContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const IncidentTypeModal = ({ visible, onClose, onSelect }) => {
    const { colorScheme } = useTheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const insets = useSafeAreaInsets()

    return (
        // animationType="fade" gives a smooth appear/disappear transition
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal={true}>
            {/* Outer overlay — tapping here dismisses the modal */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>

                    {/* Inner panel — stops touch propagation so tapping the
                        panel doesn't bubble up and trigger onClose */}
                    <TouchableWithoutFeedback>
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor: theme.uiBackground,
                                    // Match dashboard safe-area logic: use bottom inset directly.
                                    paddingBottom: insets.bottom,
                                    marginBottom: insets.bottom,
                                },
                            ]}
                        >
                            <ThemedText title={true} style={styles.heading}>
                                Select the Type of Incident
                            </ThemedText>

                            {/* 2-column grid of incident type tiles */}
                            <View style={styles.grid}>
                                {INCIDENT_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={styles.item}
                                        onPress={() => onSelect(type.value)}
                                    >
                                        {/* Colored icon box — color keyed by incident type */}
                                        <View style={[styles.iconBox, { backgroundColor: Colors.primaryDark }]}>
                                            {IncidentIconMap[type.value]
                                                ? IncidentIconMap[type.value]({ size: 36, color: Colors.white })
                                                : null}
                                        </View>
                                        <ThemedText style={styles.label}>{type.label}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default IncidentTypeModal

const styles = StyleSheet.create({
    // Semi-transparent full-screen backdrop, anchored to the bottom
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end', // panel slides up from the bottom
    },
    // The visible bottom sheet panel
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    // Two columns, wrapping onto new rows as needed
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    item: {
        width: '45%',  // ~2 per row with gap
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        textAlign: 'center',
    },
})