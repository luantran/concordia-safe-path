import { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, ScrollView, Linking, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import ThemedTextInput from "../../../components/ThemedTextInput";

const Resources = () => {
    const { user } = useUser();
    const router = useRouter();
    const [contacts, setContacts] = useState([]);

    // Form States
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Accordion States for Campus Resources
    const [showMentalHealth, setShowMentalHealth] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);

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
                .update({ name, phone_number: phone })
                .eq('id', editingId)
                .select();
            if (error) Alert.alert('Error updating', error.message);
            else {
                setContacts(contacts.map(c => c.id === editingId ? data[0] : c));
                resetForm();
            }
        } else {
            const { data, error } = await supabase
                .from('emergency_contacts')
                .insert([{ user_id: user.id, name, phone_number: phone }])
                .select();
            if (error) Alert.alert('Error saving', error.message);
            else {
                setContacts([data[0], ...contacts]);
                resetForm();
            }
        }
    }

    function resetForm() {
        setName('');
        setPhone('');
        setEditingId(null);
        setIsAdding(false);
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
        setEditingId(item.id);
        setIsAdding(true);
    }

    const openDialer = (number) => Linking.openURL(`tel:${number}`);
    const openEmail = (email) => Linking.openURL(`mailto:${email}`);

    return (
        <ThemedView style={styles.container} safe={true}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom header: back button, title, notification icon */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Resources</Text>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.headerButton}>
                    <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* --- CONTACTS CARD --- */}
                <View style={styles.mainCard}>
                    <ThemedText type="defaultSemiBold" style={styles.cardHeader}>My Emergency Contacts</ThemedText>
                    {contacts.map((item) => (
                        <View key={item.id} style={styles.contactItem}>
                            <View style={styles.contactLeft}>
                                <View style={styles.avatar}>
                                    <ThemedText style={styles.avatarText}>
                                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                                    </ThemedText>
                                </View>
                                <View>
                                    <ThemedText style={styles.contactName}>{item.name}</ThemedText>
                                    <ThemedText style={styles.contactPhone}>{item.phone_number}</ThemedText>
                                </View>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => editContact(item)} style={styles.iconBtn}>
                                    <Ionicons name="pencil" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteContact(item.id)} style={styles.iconBtn}>
                                    <Ionicons name="trash" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {isAdding ? (
                        <View style={styles.formContainer}>
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Contact Name"
                                value={name}
                                onChangeText={setName}
                            />
                            <ThemedTextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                            <View style={styles.formButtons}>
                                <TouchableOpacity style={[styles.blueButton, { flex: 1, marginRight: 10 }]} onPress={saveContact}>
                                    <ThemedText style={styles.blueButtonText}>Save</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.blueButton} onPress={() => setIsAdding(true)}>
                            <ThemedText style={styles.blueButtonText}>Add Contact to notify</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- MENTAL HEALTH ACCORDION --- */}
                <View style={styles.resourceCard}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => setShowMentalHealth(!showMentalHealth)}
                    >
                        <ThemedText type="defaultSemiBold">Mental Health Crisis Support</ThemedText>
                        <Ionicons name={showMentalHealth ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
                    </TouchableOpacity>
                    {showMentalHealth && (
                        <View style={styles.accordionContent}>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.actionBtnCall} onPress={() => openDialer('123455')}>
                                    <Ionicons name="call" size={18} color="#FFF" />
                                    <ThemedText style={styles.actionBtnTextLight}>Call</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtnEmail} onPress={() => openEmail('mentalhealth@concordia.ca')}>
                                    <Ionicons name="mail" size={18} color="#333" />
                                    <ThemedText style={styles.actionBtnTextDark}>Email</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* --- CAMPUS SECURITY ACCORDION --- */}
                <View style={styles.resourceCard}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => setShowSecurity(!showSecurity)}
                    >
                        <ThemedText type="defaultSemiBold">Contact Campus Security</ThemedText>
                        <Ionicons name={showSecurity ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
                    </TouchableOpacity>
                    {showSecurity && (
                        <View style={styles.accordionContent}>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.actionBtnCall} onPress={() => openDialer('45667')}>
                                    <Ionicons name="call" size={18} color="#FFF" />
                                    <ThemedText style={styles.actionBtnTextLight}>Call</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtnEmail} onPress={() => openEmail('campussec@concordia.ca')}>
                                    <Ionicons name="mail" size={18} color="#333" />
                                    <ThemedText style={styles.actionBtnTextDark}>Email</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* --- 911 EMERGENCY BUTTON --- */}
                <View style={styles.emergencyContainer}>
                    <TouchableOpacity style={styles.redButton} onPress={() => openDialer('911')}>
                        <ThemedText style={styles.redButtonText}>Call 911</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.emergencySubtext}>Emergency Services will be called.</ThemedText>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ThemedView>
    );
}

export default Resources;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2F5D98',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        width: 40,
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: 15,
        fontSize: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    contactName: {
        fontWeight: '500',
        fontSize: 15,
    },
    contactPhone: {
        color: '#666',
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
    },
    iconBtn: {
        padding: 8,
        marginLeft: 5,
    },
    formContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#EEE',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#FAFAFA',
    },
    formButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cancelButton: {
        padding: 12,
    },
    cancelButtonText: {
        color: '#FF3B30',
        fontWeight: '600',
    },
    blueButton: {
        backgroundColor: '#6FA3DB',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 5,
    },
    blueButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 15,
    },
    resourceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
    },
    accordionContent: {
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    actionBtnCall: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#34C759',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    actionBtnEmail: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#E5E5EA',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    actionBtnTextLight: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 6,
    },
    actionBtnTextDark: {
        color: '#333333',
        fontWeight: '600',
        marginLeft: 6,
    },
    emergencyContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    redButton: {
        backgroundColor: '#D32F2F',
        width: '100%',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    redButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emergencySubtext: {
        fontSize: 11,
        color: '#666',
        marginTop: 8,
    },
});