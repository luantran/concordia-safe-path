import React, { useState } from 'react';
import { StyleSheet, Switch, View, Alert, Text } from 'react-native';
import ThemedView from '../../components/ThemedView';
import ThemedButton from '../../components/ThemedButton';

const Preferences = () => {
const [alerts, setAlerts] = useState(true);
const [location, setLocation] = useState(false);

const handleSave = () => {
Alert.alert("Saved", "Preferences updated");
};

return (
<ThemedView style={styles.container}>
<View style={styles.row}>
<Text style={styles.text}>Incident Alerts</Text>
<Switch value={alerts} onValueChange={setAlerts} />
</View>
<View style={styles.row}>
<Text style={styles.text}>Share Location</Text>
<Switch value={location} onValueChange={setLocation} />
</View>
<ThemedButton onPress={handleSave} style={styles.button}>
<Text style={styles.buttonText}>Save</Text>
</ThemedButton>
</ThemedView>
);
};

export default Preferences;

const styles = StyleSheet.create({
container: { flex: 1, padding: 20 },
row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
text: { fontSize: 16, color: 'white' },
button: { marginTop: 20 },
buttonText: { textAlign: 'center', color: 'white' }
});