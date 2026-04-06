import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Alert, Switch, TouchableOpacity, Text, ScrollView, BackHandler } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useUser } from '../../../hooks/useUser';
import { useNetwork } from '../../../hooks/useNetwork';
import { useTheme } from '../../../contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import Spacer from "../../../components/Spacer";
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedButton from '../../../components/ThemedButton';
import OfflineActionModal from '../../../components/offline/OfflineActionModal';

const APP_DEFAULTS = {
    darkMode: false,
    accessibilityRouting: false,
    distanceNormal: '500',
    distanceSilent: '1000',
    notifProtest: 'normal',
    notifRoad: 'normal',
    notifConstruction: 'normal',
    notifVandalism: 'normal',
};

const profileToValues = (profile) => ({
    darkMode:             profile?.dark_mode              ?? APP_DEFAULTS.darkMode,
    accessibilityRouting: profile?.accessibility_routing  ?? APP_DEFAULTS.accessibilityRouting,
    distanceNormal:       profile?.distance_normal        ? profile.distance_normal.toString() : APP_DEFAULTS.distanceNormal,
    distanceSilent:       profile?.distance_silent        ? profile.distance_silent.toString() : APP_DEFAULTS.distanceSilent,
    notifProtest:         profile?.notif_protest          ?? APP_DEFAULTS.notifProtest,
    notifRoad:            profile?.notif_road             ?? APP_DEFAULTS.notifRoad,
    notifConstruction:    profile?.notif_construction     ?? APP_DEFAULTS.notifConstruction,
    notifVandalism:       profile?.notif_vandalism        ?? APP_DEFAULTS.notifVandalism,
});

const Preferences = () => {
    const { user, profile, updateProfile } = useUser();
    const { checkOnline } = useNetwork();
    const { colorScheme, setDarkMode: applyDarkMode } = useTheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [offlineModal, setOfflineModal] = useState(false);
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
        applyDarkMode(vals.darkMode);
        setPrefUpdated(false);
    }, [applyDarkMode]);

    const handleBackPress = useCallback(() => {
        if (prefUpdated) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to discard them and leave?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => { discardChanges(); router.back(); }
                    }
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
        // fresh connectivity check — avoids stale isOnline race condition
        if (!await checkOnline()) { setOfflineModal(true); return; }

        const normalVal = parseInt(distanceNormal) || 500;
        const silentVal = parseInt(distanceSilent) || 1000;
        if (silentVal <= normalVal) {
            Alert.alert('Invalid Distance Settings', '"Silent if under" must be greater than "Normal if under".');
            return;
        }
        setSaving(true);
        const newValues = { darkMode, accessibilityRouting, distanceNormal, distanceSilent, notifProtest, notifRoad, notifConstruction, notifVandalism };
        try {
            await updateProfile(user.id, {
                dark_mode:             newValues.darkMode,
                accessibility_routing: newValues.accessibilityRouting,
                distance_normal:       parseInt(newValues.distanceNormal) || 500,
                distance_silent:       parseInt(newValues.distanceSilent) || 1000,
                notif_protest:         newValues.notifProtest,
                notif_road:            newValues.notifRoad,
                notif_construction:    newValues.notifConstruction,
                notif_vandalism:       newValues.notifVandalism,
                preferences_completed: true,
            });
            applyDarkMode(newValues.darkMode);
            savedValuesRef.current = newValues;
            setPrefUpdated(false);
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
        if (!await checkOnline()) { setOfflineModal(true); return; }
        await updateProfile(user.id, { preferences_completed: true });
        router.replace('/incidents');
    };

    const markUpdated = () => setPrefUpdated(true);

    const TriToggle = ({ label, value, onValueChange }) => (
        <View style={styles.toggleRowContainer}>
            <ThemedText style={{ flex: 1, fontWeight: '500' }}>{label}</ThemedText>
            <View style={[styles.segmentedControl, { backgroundColor: theme.background }]}>
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
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerShown: false, gestureEnabled: !isFirstTime && !prefUpdated }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {isFirstTime &&
                    <ThemedText style={styles.onboardingText}>
                        Customize your app experience and notification levels.
                    </ThemedText>
                }

                <View style={[styles.section, { backgroundColor: theme.uiBackground }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: theme.title }]}>App Settings</ThemedText>
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1 }}><ThemedText>Dark Mode</ThemedText></View>
                        <Switch trackColor={{ true: Colors.primary }} onValueChange={(val) => { setDarkMode(val); markUpdated(); }} value={darkMode} />
                    </View>
                    <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1, paddingRight: 15 }}>
                            <ThemedText>Accessible Routing</ThemedText>
                            <ThemedText style={[styles.helperText, { color: theme.text }]}>Prioritize elevators and wheelchair-accessible paths in navigation previews.</ThemedText>
                        </View>
                        <Switch trackColor={{ true: Colors.primary }} onValueChange={(val) => { setAccessibilityRouting(val); markUpdated(); }} value={accessibilityRouting} />
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: theme.uiBackground }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: theme.title }]}>Distance-Based Alerts</ThemedText>
                    <ThemedText style={[styles.helperText, { color: theme.text }]}>Incidents outside these radii will be completely muted.</ThemedText>
                    <View style={styles.distanceRow}>
                        <ThemedText style={styles.distanceLabel}>Normal if under:</ThemedText>
                        <View style={[styles.radiusInputContainer, { backgroundColor: theme.background, borderColor: Colors.divider }]}>
                            <ThemedTextInput style={styles.radiusInput} value={distanceNormal} onChangeText={(val) => { setDistanceNormal(val); markUpdated(); }} keyboardType="number-pad" />
                            <ThemedText style={[styles.unitText, { color: theme.text }]}>m</ThemedText>
                        </View>
                    </View>
                    <View style={styles.distanceRow}>
                        <ThemedText style={styles.distanceLabel}>Silent if under:</ThemedText>
                        <View style={[styles.radiusInputContainer, { backgroundColor: theme.background, borderColor: Colors.divider }]}>
                            <ThemedTextInput style={styles.radiusInput} value={distanceSilent} onChangeText={(val) => { setDistanceSilent(val); markUpdated(); }} keyboardType="number-pad" />
                            <ThemedText style={[styles.unitText, { color: theme.text }]}>m</ThemedText>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: theme.uiBackground }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: theme.title }]}>Incident Type Overrides</ThemedText>
                    <ThemedText style={[styles.helperText, { color: theme.text }]}>These settings override the distance rules above.</ThemedText>
                    <View style={{ marginTop: 10 }}>
                        <TriToggle label="Protest"       value={notifProtest}      onValueChange={setNotifProtest} />
                        <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                        <TriToggle label="Road Blockage"  value={notifRoad}         onValueChange={setNotifRoad} />
                        <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                        <TriToggle label="Construction"   value={notifConstruction} onValueChange={setNotifConstruction} />
                        <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                        <TriToggle label="Vandalism"      value={notifVandalism}    onValueChange={setNotifVandalism} />
                    </View>
                </View>

                <ThemedButton style={styles.button} onPress={handleSave}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        {saving ? 'Saving...' : isFirstTime ? 'Done' : 'Save Preferences'}
                    </Text>
                </ThemedButton>

                {isFirstTime ? (
                    <TouchableOpacity onPress={handleSkip} style={styles.skip}>
                        <ThemedText style={{ color: Colors.primary, textAlign: 'center' }}>Skip for now</ThemedText>
                    </TouchableOpacity>
                ) : null}

                <Spacer height={40} />
            </ScrollView>

            <OfflineActionModal visible={offlineModal} onClose={() => setOfflineModal(false)} />
        </ThemedView>
    );
};

export default Preferences;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
    onboardingText: { marginBottom: 20, opacity: 0.7, fontSize: 14 },
    subtitle: { fontSize: 13, opacity: 0.6, marginBottom: 12 },
    section: { marginBottom: 20, padding: 18, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
    sectionTitle: { marginBottom: 15 },
    helperText: { fontSize: 13, opacity: 0.7, marginTop: 4, marginBottom: 5 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
    divider: { height: 1, backgroundColor: 'rgba(150, 150, 150, 0.1)', marginVertical: 10 },
    distanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    distanceLabel: { flex: 1, fontWeight: '500' },
    radiusInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(150, 150, 150, 0.1)', borderRadius: 8, paddingHorizontal: 10, width: 120 },
    radiusInput: { flex: 1, fontSize: 15, paddingVertical: 8, textAlign: 'center' },
    unitText: { fontSize: 14, fontWeight: 'bold', opacity: 0.5, marginLeft: 5 },
    toggleRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    segmentedControl: { flexDirection: 'row', backgroundColor: 'rgba(150, 150, 150, 0.1)', borderRadius: 8, padding: 3, width: 180 },
    segmentBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
    segmentActiveNormal: { backgroundColor: '#007AFF' },
    segmentActiveSilent: { backgroundColor: '#FF9500' },
    segmentActiveMuted: { backgroundColor: '#8E8E93' },
    segmentText: { fontSize: 12, fontWeight: '500' },
    segmentTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
    button: { width: '100%', alignItems: 'center', borderRadius: 30, marginBottom: 16, marginTop: 10 },
    skip: { paddingVertical: 8, marginBottom: 20 },
});