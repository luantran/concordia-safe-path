import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    Pressable,
    View,
    Alert
} from 'react-native';
import ThemedView from "../../components/ThemedView";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import { useContacts } from "../../hooks/useContacts";

const EmergencyContacts = () => {
    const { contacts, addContact, editContact, deleteContact } = useContacts();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    const handleSubmit = () => {
        if (editingIndex !== null) {
            editContact(editingIndex, { name, phone });
            setEditingIndex(null);
        } else {
            addContact({ name, phone });
        }
        setName('');
        setPhone('');
    };

    const handleEdit = (index) => {
        const contact = contacts[index];
        setName(contact.name);
        setPhone(contact.phone);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        Alert.alert(
            "Delete Contact",
            "Are you sure you want to delete this contact?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => deleteContact(index) }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <ThemedTextInput
                    placeholder="Contact Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <ThemedTextInput
                    placeholder="Mobile Number"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
                <ThemedButton onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>
                        {editingIndex !== null ? "Update Contact" : "Add Contact"}
                    </Text>
                </ThemedButton>

                {contacts.map((contact, index) => (
                    <View key={index} style={styles.contactContainer}>
                        <Text style={styles.contactText}>{contact.name}: {contact.phone}</Text>
                        <View style={styles.contactButtons}>
                            <Pressable onPress={() => handleEdit(index)}>
                                <Text style={styles.editButton}>Edit</Text>
                            </Pressable>
                            <Pressable onPress={() => handleDelete(index)}>
                                <Text style={styles.deleteButton}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

export default EmergencyContacts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scroll: {
        flexGrow: 1,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    contactContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    contactText: {
        fontSize: 16,
    },
    contactButtons: {
        flexDirection: 'row',
    },
    editButton: {
        color: 'blue',
        marginRight: 10,
    },
    deleteButton: {
        color: 'red',
    },
});