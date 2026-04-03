/**
 *
 * Login screen :  entry point for returning users.
 *
 *  - Collects email + password from the user.
 *  - Calls login() from UserContext, delegates to Supabase auth.
 *  - Displays error message if login fails
 *  - On success, UserContext updates  user state, triggers
 *    GuestOnly to redirect automatically to /incidents
 */

import {
    Keyboard,
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native'
import {useEffect, useState} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router} from "expo-router";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../hooks/useUser";

// themed components, handle light/dark mode automatically
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import RolePickerModal from "../../components/auth/RolePickerModal";
import AuthHeader from "../../components/auth/AuthHeader";
import LogoCard from "../../components/auth/LogoCard";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [roleModalVisible, setRoleModalVisible] = useState(false)
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

    const { login, setPendingRedirect } = useUser()

    // close modal then navigate to register with the selected role
    const handleRoleSelect = (role) => {
        setRoleModalVisible(false)
        router.push({ pathname: '/register', params: { role } })
    }

    const handleSubmit = async () => {
        setError(null);
        setPendingRedirect(false) // make sure auth listener is active before login

        try {
            await login(email, password)
            // success: UserContext updates user, GuestOnly redirects to /incidents
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        // dismiss keyboard when tapping outside inputs
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.root}>
                {/* hide header when keyboard is open to save space */}
                {!keyboardOpen && <AuthHeader />}

                {/* Logo card positioned absolutely on top of everything */}
                {!keyboardOpen && (
                    <View style={[styles.logoOverlay, { top: insets.top + 60 }]}>
                        <LogoCard />
                    </View>
                )}

                <View style={[styles.panelHost, keyboardOpen && styles.panelHostKeyboard]}>
                    <ThemedView style={[styles.panelClip, styles.container]} safe={false}>
                            <Spacer />

                            <ThemedText title={true} style={styles.title}>
                                Login to Your Account
                            </ThemedText>

                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 20 }}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={setEmail}
                                value={email}
                                icon="person-outline"
                            />

                            <ThemedTextInput
                                style={{ width: '80%', marginBottom: 20 }}
                                placeholder="Password"
                                autoCapitalize="none"
                                onChangeText={setPassword}
                                value={password}
                                secureTextEntry
                                icon="lock-closed-outline"
                            />

                            <TouchableOpacity style={{ alignSelf: 'flex-end', marginRight: '35%', marginBottom: 16 }}>
                                <ThemedText style={{ color: Colors.primary, fontSize: 13 }}>Forgot Password?</ThemedText>
                            </TouchableOpacity>

                            <Spacer />

                            {/* only rendered when theres an active error */}
                            {error && <Text style={styles.error}>{error}</Text>}

                            <ThemedButton style={styles.button} onPress={handleSubmit}>
                                <Text style={{ color: '#f2f2f2' }}>Login</Text>
                            </ThemedButton>

                            <Spacer />

                            {/* opens role picker modal before navigating to register */}
                            <TouchableOpacity onPress={() => setRoleModalVisible(true)}>
                                <ThemedText style={{ textAlign: 'center' }}>
                                    Don't have a ConSafe Path account?{' '}
                                    <ThemedText style={{ color: Colors.primary }}>Sign up</ThemedText>
                                </ThemedText>
                                <ThemedText style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 8 }}>
                                    This app uses its own account system,{"\n"}separate from your university credentials.
                                </ThemedText>
                            </TouchableOpacity>

                            <RolePickerModal
                                visible={roleModalVisible}
                                onSelect={handleRoleSelect}
                                onClose={() => setRoleModalVisible(false)}
                            />
                    </ThemedView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default Login

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
        marginTop: -20, // keep header overlap but avoid clipping the corner arcs
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
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    },
    title: {
        textAlign: "center",
        fontSize: 25,
        marginBottom: 30,
    },
    // red-tinted error banner shown below inputs on failure
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    },
    button: {
        width: '80%',
        marginBottom: 20 ,
        alignItems: 'center',
        borderRadius: 30 // pill shape
    },
    root: {
        flex: 1,
        backgroundColor: Colors.primaryDark,
        overflow: 'visible',
    },
})