/**
 * Registration screen — allows new users to create an account.
 *
 *  - Collects email + password and calls register() from UserContext.
 *  - register() calls Supabase signUp
 *  - Displays a styled error banner on failure
 *  - On success, Supabase auto-sign-in the user, triggering the GuestOnly redirect.
 *
 * TODO (Goal 1):
 *  - Add accessibility preferences step
 *  - Add privacy consent for location tracking
 */

import {
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Platform, LayoutAnimation
} from 'react-native'
import {useEffect, useState} from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useUser } from "../../hooks/useUser"
import { Colors } from "../../constants/Colors"

// themed components, handle light/dark mode automatically
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import ThemedButton from "../../components/ThemedButton"
import ThemedTextInput from "../../components/ThemedTextInput"
import EmailConfirmationModal from "../../components/auth/EmailConfirmationModal"
import AuthHeader from "../../components/auth/AuthHeader"
import LogoCard from "../../components/auth/LogoCard"

const Register = () => {
    const { role } = useLocalSearchParams() // 'student' or 'staff', passed from RolePickerModal

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // holds a human-readable string from supabase, or null
    const [error, setError] = useState(null)

    const [showConfirmation, setShowConfirmation] = useState(false)

    // register wraps supabase.auth.signUp()
    const { register, setPendingRedirect } = useUser()
    const router = useRouter()

    const [keyboardOpen, setKeyboardOpen] = useState(false)
    const insets = useSafeAreaInsets()

    // animate layout when keyboard opens/closes so nothing gets covered
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => {
            LayoutAnimation.easeInEaseOut()
            setKeyboardOpen(true)
        })
        const hide = Keyboard.addListener('keyboardDidHide', () => {
            LayoutAnimation.easeInEaseOut()
            setKeyboardOpen(false)
        })
        return () => {
            show.remove()
            hide.remove()
        }
    }, [])

    const handleSubmit = async () => {
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (!username.trim()) {
            setError("Username is required")
            return
        }

        try {
            setPendingRedirect(true)
            await register(email, password, { role, username })
            // profile created automaticaly by DB trigger using user_metadata
            // no need to call updateProfile regardless of email confirmation setting
            setShowConfirmation(true)
        } catch (e) {
            setPendingRedirect(false)
            setError(e.message)
        }
    }

    return (
        // handles keyboard overlap on ios vs android differently
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* dismiss keyboard when tapping outside inputs */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.root}>

                    <EmailConfirmationModal
                        visible={showConfirmation}
                        email={email}
                        onProceed={() => {
                            setPendingRedirect(false)
                            router.replace('/login')
                        }}
                    />

                    {/* hide header when keyboard is open to save space */}
                    {!keyboardOpen && <AuthHeader />}

                    {/* Logo card positioned absolutely on top of everything */}
                    {!keyboardOpen && (
                        <View style={[styles.logoOverlay, { top: insets.top + 60 }]}>
                            <LogoCard />
                        </View>
                    )}

                    {/* remove rounded corners when keyboard is open, looks weird otherwise */}
                    <View style={[styles.panelHost, keyboardOpen && styles.panelHostKeyboard]}>
                        <ThemedView style={[styles.panelClip, styles.container]} safe={false}>

                        {/* title changes based on role */}
                        <ThemedText title={true} style={styles.title}>
                            {role === 'staff' ? 'Staff Sign Up' : 'Student Sign Up'}
                        </ThemedText>

                        <ThemedTextInput
                            style={styles.input}
                            placeholder="Username"
                            autoCapitalize="none"
                            onChangeText={setUsername}
                            value={username}
                            icon="person-outline"
                        />

                        {/* placeholder also changes based on role */}
                        <ThemedTextInput
                            style={styles.input}
                            placeholder={role === 'staff' ? 'Staff Email' : 'Student Email'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={setEmail}
                            value={email}
                            icon="mail-outline"
                        />

                        <ThemedTextInput
                            style={styles.input}
                            placeholder="Password"
                            autoCapitalize="none"
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />
                        <Text style={styles.hint}>Password must be at least 6 characters</Text>

                        <ThemedTextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            autoCapitalize="none"
                            onChangeText={setConfirmPassword}
                            value={confirmPassword}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />

                        {/* error banner — only shown when registration fails */}
                        {error && <Text style={styles.error}>{error}</Text>}

                        <ThemedButton
                            style={styles.button}
                            onPress={handleSubmit}
                        >
                            <Text style={{ color: '#f2f2f2' }}>Sign Up</Text>
                        </ThemedButton>

                        {/* link back to login */}
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <ThemedText style={{ textAlign: 'center' }}>
                                Already have a ConSafe Path account?{' '}
                                <ThemedText style={{ color: Colors.primary }}>Log in</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 8 }}>
                            This app uses its own account system,{'\n'}separate from your university credentials.
                        </ThemedText>

                        </ThemedView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default Register

const styles = StyleSheet.create({
    logoOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
        pointerEvents: 'box-none',
    },
    panelHost: {
        flex: 1,
        marginTop: -20,
        zIndex: 10,
        overflow: 'visible',
    },
    panelHostKeyboard: {
        marginTop: 0,
    },
    panelClip: {
        borderTopLeftRadius: 44,
        borderTopRightRadius: 44,
        overflow: 'hidden',
    },
    root: {
        flex: 1,
        backgroundColor: Colors.primaryDark,
        overflow: 'visible',
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    title: {
        textAlign: "center",
        fontSize: 25,
        marginBottom: 24,
    },
    input: {
        width: '100%',
        marginBottom: 16,
    },
    button: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
        borderRadius: 30, // pill shape
    },
    // red-tinted error banner shown below inputs on failure
    hint: {
        fontSize: 12,
        color: '#140000',
        textAlign: 'center',
        marginTop: -8,
        marginBottom: 8,
    },    
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 12,
        width: '100%',
    },
})