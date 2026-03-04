import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, View, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';

// Notice we removed Spacer from the imports!
import { Colors } from '../../../constants/Colors'; 
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedTextInput from "../../../components/ThemedTextInput";
import ThemedCard from "../../../components/ThemedCard";

const Resources = () => {
    const { user } = useUser();
    const [contacts, setContacts] = useState([]);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relationship, setRelationship] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (user?.id) fetchContacts();
    }, [user]);

    async function fetchContacts() {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) Alert.alert('Error', error.message);
        else setContacts(data || []);
    }

    async function saveContact() {
        if (!name || !phone) {
            Alert.alert('Missing Info', 'Please provide a name and phone number.');
            return;
        }

        if (editingId) {
            const { data, error } = await supabase
                .from('emergency_contacts')
                .update({ name, phone_number: phone, relationship })
                .eq('id', editingId)
                .select();

            if (error) Alert.alert('Error updating contact', error.message);
            else {
                setContacts(contacts.map(c => c.id === editingId ? data[0] : c));
                resetForm();
            }
        } else {
            const { data, error } = await supabase
                .from('emergency_contacts')
                .insert([{ user_id: user.id, name, phone_number: phone, relationship }])
                .select();

            if (error) Alert.alert('Error saving contact', error.message);
            else {
                setContacts([data[0], ...contacts]);
                resetForm();
            }
        }
    }

    function resetForm() {
        setName('');
        setPhone('');
        setRelationship('');
        setEditingId(null);
    }

    async function deleteContact(id) {
        Alert.alert(
            "Delete Contact",
            "Are you sure you want to remove this emergency contact?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
                        if (error) Alert.alert('Error deleting', error.message);
                        else setContacts(contacts.filter(contact => contact.id !== id));
                    }
                }
            ]
        );
    }

    function editContact(item) {
        setName(item.name);
        setPhone(item.phone_number);
        setRelationship(item.relationship || '');
        setEditingId(item.id);
    }

    return (
        <ThemedView style={styles.container} safe={true}>
            <ThemedText title={true} style={styles.pageTitle}>Emergency Resources</ThemedText>

            {/* --- TOP PANE: THE FORM --- */}
            <View style={styles.formPane}>
                <View style={styles.inputTight}>
                    <ThemedTextInput placeholder="Contact Name" value={name} onChangeText={setName} />
                </View>
                <View style={styles.inputTight}>
                    <ThemedTextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View style={styles.inputTight}>
                    <ThemedTextInput placeholder="Relationship (e.g., Roommate, Mother)" value={relationship} onChangeText={setRelationship} />
                </View>
                
                <TouchableOpacity style={[styles.saveButton, editingId && styles.updateButton]} onPress={saveContact}>
                    <ThemedText style={styles.saveButtonText}>
                        {editingId ? "Update Contact" : "Save Contact"}
                    </ThemedText>
                </TouchableOpacity>

                {editingId && (
                    <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                        <ThemedText style={styles.cancelButtonText}>Cancel Edit</ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            {/* --- BOTTOM PANE: THE LIST --- */}
            <View style={styles.listPane}>
                <ThemedText type="subtitle" style={styles.listHeader}>My Contacts</ThemedText>

                <FlatList
                    data={contacts}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20 }} // Adds breathing room at the very bottom of the scroll
                    renderItem={({ item }) => (
                        <View style={styles.compactCardWrapper}>
                            <ThemedCard>
                                <View style={styles.cardRow}>
                                    <View style={styles.cardText}>
                                        <ThemedText type="defaultSemiBold">
                                            {item.name} {item.relationship ? `(${item.relationship})` : null}
                                        </ThemedText>
                                        <ThemedText>{item.phone_number}</ThemedText>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity onPress={() => editContact(item)} style={styles.iconButton}>
                                            <Ionicons name="pencil" size={20} color="#007AFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteContact(item.id)} style={styles.iconButton}>
                                            <Ionicons name="trash" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ThemedCard>
                        </View>
                    )}
                    ListEmptyComponent={
                        <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
                            No emergency contacts saved yet.
                        </ThemedText>
                    }
                />
            </View>
        </ThemedView>
    );
}

export default Resources;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    pageTitle: {
        marginBottom: 15, // Replaces the top spacer
    },
    
    // --- FORM PANE STYLES ---
    formPane: {
        backgroundColor: 'rgba(150, 150, 150, 0.08)', // Subtle grey background to group the form
        padding: 15,
        borderRadius: 12,
        marginBottom: 20, // Space between form and list
    },
    inputTight: {
        marginBottom: 10, // Much tighter than the Spacer component
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 12, // Slightly thinner padding
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    updateButton: {
        backgroundColor: '#34C759',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FF3B30',
        fontSize: 14,
    },

    // --- LIST PANE STYLES ---
    listPane: {
        flex: 1, // This forces the list area to consume all remaining screen height
    },
    listHeader: {
        marginBottom: 10,
    },
    compactCardWrapper: {
        width: '100%',
        marginBottom: 8, // Tighter gap between contact cards
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8, // Reduced padding inside the card
    },
    cardText: {
        flex: 1,
        marginRight: 10,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 6,
        marginLeft: 4,
    },
});