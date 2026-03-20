import { useState, useEffect, useCallback, useRef } from 'react';
import {StyleSheet, View, Alert, Switch, TouchableOpacity, Text, ScrollView, BackHandler, Modal} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useUser } from '../../../hooks/useUser';
import { Colors } from '../../../constants/Colors';
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedButton from '../../../components/ThemedButton';
import {Ionicons} from "@expo/vector-icons";

// ─── App-wide defaults ────────────────────────────────────────────────────────
const APP_DEFAULTS = {
    darkMode: false,
    accessibilityRouting: false,
    distanceNormal: 100,
    distanceSilent: 150,
    notifProtest: 'normal',
    notifRoad: 'normal',
    notifConstruction: 'normal',
    notifVandalism: 'normal',
    normalEnabled: true,
    silentEnabled: true,
};

const profileToValues = (profile) => ({
    darkMode:             profile?.dark_mode              ?? APP_DEFAULTS.darkMode,
    accessibilityRouting: profile?.accessibility_routing  ?? APP_DEFAULTS.accessibilityRouting,
    distanceNormal:       profile?.distance_normal        ?? APP_DEFAULTS.distanceNormal,
    distanceSilent:       profile?.distance_silent        ?? APP_DEFAULTS.distanceSilent,
    notifProtest:         profile?.notif_protest          ?? APP_DEFAULTS.notifProtest,
    notifRoad:            profile?.notif_road             ?? APP_DEFAULTS.notifRoad,
    notifConstruction:    profile?.notif_construction     ?? APP_DEFAULTS.notifConstruction,
    notifVandalism:       profile?.notif_vandalism        ?? APP_DEFAULTS.notifVandalism,
    normalEnabled: profile?.distance_normal_enabled ?? true,
    silentEnabled: profile?.distance_silent_enabled ?? true,
});

const Preferences = () => {
    const { user, profile, updateProfile } = useUser();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const isFirstTime = !profile?.preferences_completed;

    const savedValuesRef = useRef(profileToValues(profile));
    const [prefUpdated, setPrefUpdated] = useState(false);

    const [darkMode,             setDarkMode]             = useState(savedValuesRef.current.darkMode);
    const [accessibilityRouting, setAccessibilityRouting] = useState(savedValuesRef.current.accessibilityRouting);
    const [distanceNormal,       setDistanceNormal]       = useState(savedValuesRef.current.distanceNormal);
    const [distanceSilent,       setDistanceSilent]       = useState(savedValuesRef.current.distanceSilent);
    const [notifProtest,         setNotifProtest]         = useState(savedValuesRef.current.notifProtest);
    const [notifRoad,            setNotifRoad]            = useState(savedValuesRef.current.notifRoad);
    const [notifConstruction,    setNotifConstruction]    = useState(savedValuesRef.current.notifConstruction);
    const [notifVandalism,       setNotifVandalism]       = useState(savedValuesRef.current.notifVandalism);
    const [distanceInfoVisible, setDistanceInfoVisible] = useState(false)

    const [normalEnabled, setNormalEnabled] = useState(true)
    const [silentEnabled, setSilentEnabled] = useState(true)

    const profileLoadedRef = useRef(false);
    useEffect(() => {
        if (profile && !profileLoadedRef.current) {
            profileLoadedRef.current = true;
            const vals = profileToValues(profile);
            savedValuesRef.current = vals;
            setDarkMode(vals.darkMode);
            setAccessibilityRouting(vals.accessibilityRouting);
            setDistanceNormal(vals.distanceNormal);
            setDistanceSilent(vals.distanceSilent);
            setNotifProtest(vals.notifProtest);
            setNotifRoad(vals.notifRoad);
            setNotifConstruction(vals.notifConstruction);
            setNotifVandalism(vals.notifVandalism);
            setPrefUpdated(false);
        }
    }, [profile]);

    const discardChanges = useCallback(() => {
        const vals = savedValuesRef.current;
        setDarkMode(vals.darkMode);
        setAccessibilityRouting(vals.accessibilityRouting);
        setDistanceNormal(vals.distanceNormal);
        setDistanceSilent(vals.distanceSilent);
        setNotifProtest(vals.notifProtest);
        setNotifRoad(vals.notifRoad);
        setNotifConstruction(vals.notifConstruction);
        setNotifVandalism(vals.notifVandalism);
        setPrefUpdated(false);
    }, []);

    const handleBackPress = useCallback(() => {
        if (prefUpdated) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to discard them and leave?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => { discardChanges(); router.back(); } }
                ]
            );
            return true;
        }
        router.back();
        return true;
    }, [prefUpdated, discardChanges, router]);

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (prefUpdated) { handleBackPress(); return true; }
            return false;
        });
        return () => subscription.remove();
    }, [prefUpdated, handleBackPress]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user.id, {
                dark_mode:             darkMode,
                accessibility_routing: accessibilityRouting,
                distance_normal:       distanceNormal,
                distance_silent:       distanceSilent,
                notif_protest:         notifProtest,
                notif_road:            notifRoad,
                notif_construction:    notifConstruction,
                notif_vandalism:       notifVandalism,
                preferences_completed: true,
                distance_normal_enabled: normalEnabled,
                distance_silent_enabled: silentEnabled,
            });
            savedValuesRef.current = { darkMode, accessibilityRouting, distanceNormal, distanceSilent, notifProtest, notifRoad, notifConstruction, notifVandalism };
            setPrefUpdated(false);
            if (isFirstTime) {
                router.replace('/incidents');
            } else {
                Alert.alert('Success', 'Your safety preferences have been updated.');
            }
        } catch (error) {
            Alert.alert('Error', 'Could not save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        await updateProfile(user.id, { preferences_completed: true });
        router.replace('/incidents');
    };

    const markUpdated = () => setPrefUpdated(true);

    // tri-toggle for incident type notification level
    const TriToggle = ({ label, value, onValueChange }) => (
        <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            <View style={styles.segmentedControl}>
                {[
                    { key: 'normal', label: 'Normal', activeStyle: styles.segmentActiveNormal },
                    { key: 'silent', label: 'Silent', activeStyle: styles.segmentActiveSilent },
                    { key: 'muted',  label: 'Mute',   activeStyle: styles.segmentActiveMuted  },
                ].map(({ key, label: btnLabel, activeStyle }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.segmentBtn, value === key && activeStyle]}
                        onPress={() => { onValueChange(key); markUpdated(); }}
                    >
                        <ThemedText style={[styles.segmentText, value === key && styles.segmentTextActive]}>
                            {btnLabel}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container} safe={true}>
            <Stack.Screen options={{ headerShown: false, gestureEnabled: !isFirstTime && !prefUpdated }} />

            {isFirstTime && (
                <ThemedText style={styles.onboardingText}>
                    Customize your experience and notification preferences.
                </ThemedText>
            )}

            {/* APP SETTINGS */}
            <ThemedText style={styles.sectionLabel}>App Settings</ThemedText>
            <View style={styles.card}>
                <View style={styles.row}>
                    <ThemedText style={styles.rowLabel}>Dark Mode</ThemedText>
                    <Switch
                        trackColor={{ true: Colors.primary }}
                        onValueChange={(val) => { setDarkMode(val); markUpdated(); }}
                        value={darkMode}
                    />
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <View style={{ flex: 1, paddingRight: 15 }}>
                        <ThemedText style={styles.rowLabel}>Accessible Routing</ThemedText>
                        <ThemedText style={styles.helperText}>Prioritize elevators and accessible paths.</ThemedText>
                    </View>
                    <Switch
                        trackColor={{ true: Colors.primary }}
                        onValueChange={(val) => { setAccessibilityRouting(val); markUpdated(); }}
                        value={accessibilityRouting}
                    />
                </View>
            </View>

            {/* ALERT DISTANCES */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <ThemedText style={styles.sectionLabel}>Alert Distances</ThemedText>
                <TouchableOpacity onPress={() => setDistanceInfoVisible(true)}>
                    <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
            </View>
            <ThemedText style={styles.sectionHelper}>
                Normal alerts show a popup. Silent alerts send a push notification only.
            </ThemedText>
            <View style={styles.card}>
                {/* normal distance slider */}
                <View style={styles.sliderRow}>
                    <ThemedText style={styles.rowLabel}>Normal</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText style={styles.sliderValue}>{normalEnabled ? `${distanceNormal}m` : 'Off'}</ThemedText>
                        <Switch
                            value={normalEnabled}
                            onValueChange={(val) => { setNormalEnabled(val); markUpdated(); }}
                            trackColor={{ true: Colors.primary }}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                </View>
                {normalEnabled &&
                    <Slider
                        style={styles.slider}
                        minimumValue={100}
                        maximumValue={500}
                        step={50}
                        value={distanceNormal}
                        onValueChange={(val) => {
                            setDistanceNormal(val);
                            if (val >= distanceSilent) setDistanceSilent(val + 50);
                            markUpdated();
                        }}
                        minimumTrackTintColor={Colors.primary}
                        maximumTrackTintColor="#ccc"
                        thumbTintColor={Colors.primary}
                    />
                }

                <View style={styles.divider} />

                {/* silent distance slider — must be >= normal */}
                <View style={styles.divider} />
                <View style={styles.sliderRow}>
                    <ThemedText style={styles.rowLabel}>Silent</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ThemedText style={styles.sliderValue}>{silentEnabled ? `${distanceSilent}m` : 'Off'}</ThemedText>
                        <Switch
                            value={silentEnabled}
                            onValueChange={(val) => { setSilentEnabled(val); markUpdated(); }}
                            trackColor={{ true: Colors.primary }}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                </View>
                {silentEnabled &&
                    <Slider
                        style={styles.slider}
                        minimumValue={100}
                        maximumValue={500}
                        step={50}
                        value={distanceSilent}
                        onValueChange={(val) => {
                            setDistanceSilent(val);
                            if (val <= distanceNormal) setDistanceNormal(Math.max(100, val - 50));
                            markUpdated();
                        }}
                        minimumTrackTintColor="#F59E0B"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#F59E0B"
                    />
                }
            </View>

            {/* INCIDENT TYPE OVERRIDES */}
            <ThemedText style={styles.sectionLabel}>Incident Type Overrides</ThemedText>
            <ThemedText style={styles.sectionHelper}>These override the distance rules above.</ThemedText>
            <View style={styles.card}>
                <TriToggle label="Protest"       value={notifProtest}      onValueChange={setNotifProtest} />
                <View style={styles.divider} />
                <TriToggle label="Road Blockage" value={notifRoad}         onValueChange={setNotifRoad} />
                <View style={styles.divider} />
                <TriToggle label="Construction"  value={notifConstruction} onValueChange={setNotifConstruction} />
                <View style={styles.divider} />
                <TriToggle label="Vandalism"     value={notifVandalism}    onValueChange={setNotifVandalism} />
            </View>

            {/* SAVE */}
            <ThemedButton style={styles.button} onPress={handleSave}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {saving ? 'Saving...' : isFirstTime ? 'Done' : 'Save Preferences'}
                </Text>
            </ThemedButton>

            {isFirstTime && (
                <TouchableOpacity onPress={handleSkip} style={styles.skip}>
                    <ThemedText style={{ color: Colors.primary, textAlign: 'center' }}>Skip for now</ThemedText>
                </TouchableOpacity>
            )}
            {/* distance info modal */}
            <Modal
                visible={distanceInfoVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDistanceInfoVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setDistanceInfoVisible(false)}
                >
                    <View style={styles.modalCard}>
                        <ThemedText style={styles.modalTitle}>Alert Distances</ThemedText>
                        <ThemedText style={styles.modalBody}>
                            <ThemedText style={{ fontWeight: 'bold' }}>Normal</ThemedText>
                            {' — within this distance of an incident, you get a popup and a push notification.\n\n'}
                            <ThemedText style={{ fontWeight: 'bold' }}>Silent</ThemedText>
                            {' — further out than Normal, you get a push notification only with no popup interruption.\n\n'}
                            Silent must always be greater than Normal. If you drag Normal past Silent, Silent will automatically adjust.
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setDistanceInfoVisible(false)}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ThemedView>
    );
};

export default Preferences;

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
    onboardingText: { marginBottom: 12, opacity: 0.7, fontSize: 14, textAlign: 'center' },

    sectionLabel: { fontSize: 13, fontWeight: '600', opacity: 0.5, marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionHelper: { fontSize: 12, opacity: 0.5, marginBottom: 6, marginTop: -4 },

    // card: { borderRadius: 12, backgroundColor: 'rgba(150,150,150,0.08)', paddingHorizontal: 14, marginBottom: 4 },
    card: { borderRadius: 12, backgroundColor: 'rgba(150,150,150,0.08)', paddingHorizontal: 14, paddingVertical: 0, marginBottom: 4 },

    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
    rowLabel: { fontSize: 15, fontWeight: '500' },

    helperText: { fontSize: 12, opacity: 0.6, marginTop: 2 },

    divider: { backgroundColor: 'rgba(150,150,150,0.3)' },

    // distance sliders
    sliderValue: { fontSize: 14, fontWeight: '600', opacity: 0.7 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 0 },
    slider: { width: '100%', height: 24 },

    // tri-toggle
    segmentedControl: { flexDirection: 'row', backgroundColor: 'rgba(150,150,150,0.1)', borderRadius: 8, padding: 3, width: 180 },
    segmentBtn: { flex: 1, paddingVertical: 5, alignItems: 'center', borderRadius: 6 },
    segmentActiveNormal: { backgroundColor: '#007AFF' },
    segmentActiveSilent: { backgroundColor: '#FF9500' },
    segmentActiveMuted:  { backgroundColor: '#8E8E93' },
    segmentText: { fontSize: 12, fontWeight: '500' },
    segmentTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

    button: { width: '100%', alignItems: 'center', borderRadius: 30, marginTop: 16, marginBottom: 8 },
    skip: { paddingVertical: 8 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 12,
        color: '#000',
    },
    modalBody: {
        fontSize: 14,
        lineHeight: 22,
        color: '#333',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
});