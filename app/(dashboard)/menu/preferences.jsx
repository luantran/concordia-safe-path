import { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Switch, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { useUser } from '../../../hooks/useUser';
import { Colors } from '../../../constants/Colors';
import Spacer from "../../../components/Spacer";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedButton from '../../../components/ThemedButton';

const Preferences = () => {
    const { user, profile, updateProfile } = useUser();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // True only on the first visit — used to decide whether to redirect after saving
    const isFirstTime = !profile?.preferences_completed;

    // Preference States
    const [medicalNotes, setMedicalNotes] = useState('');
    const [alertRadius, setAlertRadius] = useState('500');
    const [silentProtest, setSilentProtest] = useState(false);
    const [silentRoad, setSilentRoad] = useState(false);
    const [silentConstruction, setSilentConstruction] = useState(false);
    const [silentVandalism, setSilentVandalism] = useState(false);

    // Derived state: checks if ALL toggles are currently ON
    const isAllSilent = silentProtest && silentRoad && silentConstruction && silentVandalism;

    // Load existing preferences from the global profile state
    useEffect(() => {
        if (profile) {
            setMedicalNotes(profile.medical_notes || '');
            setAlertRadius(profile.alert_radius ? profile.alert_radius.toString() : '500');
            setSilentProtest(profile.silent_protest || false);
            setSilentRoad(profile.silent_road || false);
            setSilentConstruction(profile.silent_construction || false);
            setSilentVandalism(profile.silent_vandalism || false);
        }
    }, [profile]);

    // Handle Master Toggle
    const handleMasterToggle = (value) => {
        setSilentProtest(value);
        setSilentRoad(value);
        setSilentConstruction(value);
        setSilentVandalism(value);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user.id, {
                medical_notes: medicalNotes,
                alert_radius: parseInt(alertRadius) || 500,
                silent_protest: silentProtest,
                silent_road: silentRoad,
                silent_construction: silentConstruction,
                silent_vandalism: silentVandalism,
                preferences_completed: true // Mark onboarding as complete
            });

            // Redirect on first-time onboarding; returning users get a success popup
            if (isFirstTime) {
                router.replace('/incidents');
            } else {
                Alert.alert('Success', 'Your safety preferences have been updated.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not save preferences.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        // Just mark as completed and redirect, leaving default preferences
        await updateProfile(user.id, { preferences_completed: true });
        router.replace('/incidents');
    };

    return (
        <ThemedView style={styles.container} safe={true}>
            {/* ScrollView prevents the keyboard from blocking content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                <ThemedText title={true} style={styles.pageTitle}>Safety Preferences</ThemedText>
                
                {isFirstTime && (
                    <ThemedText style={styles.onboardingText}>
                        Welcome! Let's configure your safety alerts before you enter the dashboard.
                    </ThemedText>
                )}

                {/* --- ICE MEDICAL NOTES --- */}
                <View style={styles.section}>
                    <ThemedText type="defaultSemiBold">Medical Notes (ICE)</ThemedText>
                    <ThemedText style={styles.helperText}>Visible to campus security during an active SOS.</ThemedText>
                    <View style={styles.textAreaContainer}>
                        <ThemedTextInput
                            style={styles.textArea}
                            placeholder="Allergies, blood type, chronic conditions..."
                            value={medicalNotes}
                            onChangeText={setMedicalNotes}
                            multiline={true}
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* --- ALERT RADIUS --- */}
                <View style={styles.section}>
                    <ThemedText type="defaultSemiBold">Loud Alert Radius</ThemedText>
                    <ThemedText style={styles.helperText}>Incidents outside this radius will be delivered silently.</ThemedText>
                    <View style={styles.radiusInputContainer}>
                        <ThemedTextInput
                            style={styles.radiusInput}
                            value={alertRadius}
                            onChangeText={setAlertRadius}
                            keyboardType="number-pad"
                            placeholder="e.g., 500"
                        />
                        <ThemedText style={styles.unitText}>meters</ThemedText>
                    </View>
                </View>

                {/* --- SILENT NOTIFICATIONS BY TYPE --- */}
                <View style={styles.section}>
                    <ThemedText type="defaultSemiBold">Silent Notifications</ThemedText>
                    <ThemedText style={styles.helperText}>Select incident types that should bypass loud alerts regardless of distance.</ThemedText>
                    
                    <View style={styles.toggleGroup}>
                        {/* Master Toggle */}
                        <View style={styles.masterToggleRow}>
                            <ThemedText style={styles.masterToggleText}>Mute All Below</ThemedText>
                            <Switch
                                trackColor={{ false: "#767577", true: Colors.light?.tint || "#007AFF" }}
                                onValueChange={handleMasterToggle}
                                value={isAllSilent}
                            />
                        </View>
                        
                        <View style={styles.divider} />

                        {/* Individual Toggles */}
                        <View style={styles.toggleRow}>
                            <ThemedText>Protest</ThemedText>
                            <Switch onValueChange={setSilentProtest} value={silentProtest} />
                        </View>
                        <View style={styles.toggleRow}>
                            <ThemedText>Road Blockage</ThemedText>
                            <Switch onValueChange={setSilentRoad} value={silentRoad} />
                        </View>
                        <View style={styles.toggleRow}>
                            <ThemedText>Construction</ThemedText>
                            <Switch onValueChange={setSilentConstruction} value={silentConstruction} />
                        </View>
                        <View style={styles.toggleRow}>
                            <ThemedText>Vandalism</ThemedText>
                            <Switch onValueChange={setSilentVandalism} value={silentVandalism} />
                        </View>
                    </View>
                </View>

                {/* --- ACTIONS --- */}
                <ThemedButton style={styles.button} onPress={handleSave}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        {saving ? "Saving..." : (isFirstTime ? "Done" : "Save Preferences")}
                    </Text>
                </ThemedButton>

                {isFirstTime && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skip}>
                        <ThemedText style={{ color: Colors.light?.tint || '#007AFF', textAlign: 'center' }}>
                            Skip for now
                        </ThemedText>
                    </TouchableOpacity>
                )}
                
                {/* Extra space at bottom for scrolling clearance */}
                <Spacer height={40} /> 
            </ScrollView>
        </ThemedView>
    );
}

export default Preferences;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    pageTitle: {
        marginBottom: 10,
    },
    onboardingText: {
        marginBottom: 20,
        opacity: 0.7,
        fontSize: 14,
    },
    section: {
        marginBottom: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.05)',
        padding: 15,
        borderRadius: 12,
    },
    helperText: {
        fontSize: 13,
        opacity: 0.7,
        marginTop: 4,
        marginBottom: 10,
    },
    
    // Text Area Styles
    textAreaContainer: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 8,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 10,
        paddingHorizontal: 10,
    },

    // Radius Input Styles
    radiusInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    radiusInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    unitText: {
        fontSize: 16,
        fontWeight: 'bold',
        opacity: 0.5,
        marginLeft: 5,
    },

    // Toggle Group Styles
    toggleGroup: {
        marginTop: 5,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    masterToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
    },
    masterToggleText: {
        fontWeight: 'bold',
        color: Colors.light?.tint || '#007AFF', 
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        marginBottom: 10,
    },

    // Action Buttons
    button: {
        width: '100%',
        alignItems: 'center',
        borderRadius: 30,
        marginBottom: 16,
        marginTop: 10,
    },
    skip: {
        paddingVertical: 8,
        marginBottom: 20,
    },
});





// import { StyleSheet, TouchableOpacity, Text } from 'react-native'
// import { useRouter } from 'expo-router'

// import { useUser } from '../../../hooks/useUser'
// import { Colors } from '../../../constants/Colors'
// import ThemedView from '../../../components/ThemedView'
// import ThemedText from '../../../components/ThemedText'
// import ThemedButton from '../../../components/ThemedButton'

// const Preferences = () => {
//     const { user, profile, updateProfile } = useUser()
//     const router = useRouter()

//     // true only on the first visit — used to decide whether to redirect after saving
//     const isFirstTime = !profile?.preferences_completed

//     const handleDone = async () => {
//         await updateProfile(user.id, { preferences_completed: true })
//         // only redirect on first-time onboarding; returning users stay on this screen
//         if (isFirstTime) router.replace('/incidents')
//     }

//     return (
//         <ThemedView style={styles.container} safe={true}>

//             <ThemedText title={true}>Preferences</ThemedText>
//             <ThemedText style={styles.placeholder}>Preferences content coming soon.</ThemedText>

//             <ThemedButton style={styles.button} onPress={handleDone}>
//                 <Text style={{ color: '#fff' }}>Done</Text>
//             </ThemedButton>
//             {isFirstTime &&
//                 <TouchableOpacity onPress={handleDone} style={styles.skip}>
//                     <ThemedText style={{ color: Colors.primary, textAlign: 'center' }}>Skip for now</ThemedText>
//                 </TouchableOpacity>
//             }
//         </ThemedView>
//     )
// }

// export default Preferences

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 28,
//     },
//     placeholder: {
//         opacity: 0.5,
//         marginVertical: 32,
//         textAlign: 'center',
//     },
//     button: {
//         width: '100%',
//         alignItems: 'center',
//         borderRadius: 30,
//         marginBottom: 16,
//     },
//     skip: {
//         paddingVertical: 8,
//     },
// })