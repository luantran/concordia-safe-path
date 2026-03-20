import {Modal, StyleSheet, TouchableOpacity, View, Image, TouchableWithoutFeedback} from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import { Ionicons } from '@expo/vector-icons'
import {useTheme} from "../../contexts/ThemeContext";

// modal to pick role (student or staff) before proceding with signup
const RolePickerModal = ({ visible, onSelect, onClose }) => {
    const { theme } = useTheme()

    return (
        // tapping outside the card closes the modal

        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>

                <View style={styles.overlay}>
                    {/* stop propagation so tapping inside the card doesnt bubble up to overlay and close the modal */}
                    <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>

                        <ThemedView style={styles.card}>
                            {/* close btn top right */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close-circle" size={28} color={Colors.primaryDark} />
                            </TouchableOpacity>
                            <Image
                                source={require('../../assets/img/concordia_logo_light.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />

                            <ThemedText style={styles.title}>Are you a</ThemedText>

                            {/* student option */}
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => onSelect('student')}
                            >
                                <Ionicons name="school" size={20} color={Colors.primaryDark} />
                                <ThemedText style={[styles.optionText, { color: Colors.primaryDark }]}>
                                    Student
                                </ThemedText>
                            </TouchableOpacity>

                            <ThemedText style={styles.or}>or</ThemedText>

                            {/* staff option */}
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => onSelect('staff')}
                            >
                                <Ionicons name="card" size={20} color={Colors.primaryDark} />
                                <ThemedText style={[styles.optionText, { color: Colors.primaryDark }]}>
                                    Staff
                                </ThemedText>
                            </TouchableOpacity>

                        </ThemedView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default RolePickerModal

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject, // covers entire screen
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        paddingTop: 180, // pushes card down a bit
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
    },
    card: {
        width: '100%',
        borderRadius: 20,
        paddingVertical: 48,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 16,
        borderWidth: 2,
        borderColor: Colors.primaryDark,
    },
    logo: {
        width: 64,
        height: 64,
        marginBottom: 8,
    },
    title: {
        fontSize: 17,
        marginBottom: 8,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        paddingVertical: 18,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primaryDark, // matches card border
    },
    optionText: {
        fontWeight: '700',
        fontSize: 16,
    },
    or: {
        opacity: 0.5, // muted seperator
        fontSize: 13,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
})