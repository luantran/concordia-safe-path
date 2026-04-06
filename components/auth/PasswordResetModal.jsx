import { Modal, StyleSheet, TouchableOpacity, View, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useState, useEffect } from 'react'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import { useTheme } from '../../contexts/ThemeContext'

// two-step modal: enter email → confirmation sent
const PasswordResetModal = ({ visible, onClose }) => {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const { colorScheme } = useTheme()
    const isDark = colorScheme === 'dark'
    const [keyboardVisible, setKeyboardVisible] = useState(false)

    const handleSend = () => {
        if (!email.trim()) return
        // pretend to send — just show confirmation
        setSent(true)
    }

    const handleClose = () => {
        // reset state for next time
        setEmail('')
        setSent(false)
        onClose()
    }

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
        return () => { show.remove(); hide.remove() }
    }, [])

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.overlay, keyboardVisible && styles.overlayKeyboard]}>
                    <ThemedView style={styles.card}>

                        {!sent ? (
                            // step 1 — enter email
                            <>
                                <ThemedText title={true} style={styles.title}>
                                    Reset Password
                                </ThemedText>

                                <ThemedText style={styles.subtitle}>
                                    Enter your email address and we'll send you a link to reset your password.
                                </ThemedText>

                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: isDark ? '#2f2b3d' : '#F3F4F6',
                                            color: isDark ? '#fff' : '#111',
                                            borderColor: isDark ? '#4a4560' : '#E5E7EB',
                                        }
                                    ]}
                                    placeholder="Email address"
                                    placeholderTextColor={isDark ? '#888' : '#9CA3AF'}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />

                                <TouchableOpacity style={styles.button} onPress={handleSend}>
                                    <ThemedText style={styles.buttonText}>Send Reset Link</ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleClose}>
                                    <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // step 2 — confirmation
                            <>
                                <ThemedText title={true} style={styles.title}>
                                    Check Your Email
                                </ThemedText>

                                <ThemedText style={styles.subtitle}>
                                    We've sent a password reset link to{' '}
                                    <ThemedText style={styles.email}>{email}</ThemedText>
                                    . Follow the link in the email to reset your password.
                                </ThemedText>

                                <TouchableOpacity style={styles.button} onPress={handleClose}>
                                    <ThemedText style={styles.buttonText}>Back to Login</ThemedText>
                                </TouchableOpacity>
                            </>
                        )}

                    </ThemedView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default PasswordResetModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    overlayKeyboard: {
        justifyContent: 'flex-start',
        paddingTop: 80,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.7,
        marginBottom: 8,
    },
    email: {
        fontWeight: '600',
        opacity: 1,
        color: Colors.primary,
    },
    input: {
        width: '100%',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 30,
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    cancelText: {
        fontSize: 14,
        opacity: 0.6,
        marginTop: 4,
    },
})