import {
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Pressable,
    View
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'

import {useEffect, useState} from 'react'
import MapView, { Marker } from 'react-native-maps'
import {Ionicons} from "@expo/vector-icons";
import * as Location from 'expo-location'


// themed components
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import ThemedTextInput from "../../components/ThemedTextInput"
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import ThemedLoader from "../../components/ThemedLoader";
import IncidentTypeModal from '../../components/modals/IncidentTypeModal'
import OfflineActionModal from "../../components/offline/OfflineActionModal"


//hooks
import {useIncidents} from "../../hooks/useIncidents";
import { useNetwork } from "../../hooks/useNetwork"

//Constants
import {Colors} from "../../constants/Colors";
import {useTheme} from "../../contexts/ThemeContext";

const Create = () => {
    const { type: initialType } = useLocalSearchParams()
    const [typeModalOpen, setTypeModalOpen] = useState(false)
    const { theme } = useTheme()

    const [type, setType] = useState('')
    const [severity, setSeverity] = useState('low')
    const [description, setDescription] = useState("")

    const [pin, setPin] = useState(null)

    const [loading, setLoading] = useState(false)
    const [offlineModal, setOfflineModal] = useState(false)
    const { isOnline } = useNetwork()
    const { createIncident } = useIncidents()
    const router = useRouter()

    const [userCoords, setUserCoords] = useState(null)

    useEffect(() => {
        async function getLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return
            const current = await Location.getCurrentPositionAsync({})
            setUserCoords(current.coords)
        }
        getLocation()
    }, [])

    useEffect(() => {
        if (initialType) setType(initialType)
        setPin(null)
    }, [initialType])

    async function handleSubmit() {
        if (!isOnline) { setOfflineModal(true); return }

        if (!type.trim() || !severity.trim() || !pin) return

        setLoading(true)

        await createIncident({ type, description, severity, latitude: pin.latitude, longitude: pin.longitude })

        setType("")
        setSeverity("")
        setDescription("")
        setPin(null)

        router.replace("/incidents")
        setLoading(false)


    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <ThemedView style={styles.container}>
                    <Spacer height={10}/>
                    {pin
                        ? <ThemedText style={styles.pinConfirm}>📍 Pin placed</ThemedText>
                        : <ThemedText style={styles.pinHint}>Select the location</ThemedText>
                    }
                    <Spacer height={6} />

                    <ThemedView style={styles.mapContainer}>
                        {!userCoords && <ThemedLoader />}
                        {userCoords && (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: 45.4948,
                                    longitude: -73.5772,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                showsUserLocation={true}
                                showsPointsOfInterest={false}
                                showsBuildings={false}
                                showsTraffic={false}
                                showsIndoors={false}
                                showsCompass={false}
                                toolbarEnabled={false}
                                onPress={(e) => setPin(e.nativeEvent.coordinate)}
                            >
                                {pin && (
                                    <Marker
                                        coordinate={pin}
                                        draggable
                                        onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
                                    />
                                )}
                            </MapView>
                        )}
                    </ThemedView>

                    <Spacer height={10}/>

                    <Pressable
                        style={[styles.input, { backgroundColor: theme.uiBackground, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                        onPress={() => setTypeModalOpen(true)}
                    >
                        <ThemedText style={!type && { opacity: 0.4 }}>
                            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Incident Type'}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={18} color={theme.text} />
                    </Pressable>

                    <Spacer height={10}/>


                    <ThemedText style={styles.label}>Set Severity</ThemedText>
                    <View style={styles.severityContainer}>
                        {[
                            { value: 'high',   label: 'High' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'low',    label: 'Low' },
                        ].map((s, index) => (
                            <Pressable
                                key={s.value}
                                onPress={() => setSeverity(s.value)}
                                style={[
                                    styles.severitySegment,
                                    { backgroundColor: Colors.severity[s.value] },
                                    severity === s.value && styles.severitySelected,
                                    index === 0 && styles.severityLeft,
                                    index === 2 && styles.severityRight,
                                ]}
                            >
                                <Text style={[
                                    // severityText style in StyleSheet
                                    {
                                        severityText: {
                                            color: Colors.white,
                                            fontWeight: 'bold',
                                            fontSize: 14,
                                        }
                                    },
                                    severity === s.value && { color: Colors.black }
                                ]}>
                                    {s.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Spacer height={10}/>
                    <ThemedTextInput
                        style={styles.multiline}
                        placeholder="Write a short description of the incident"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                    />

                    <ThemedButton
                        onPress={handleSubmit}
                        disabled={ loading || !pin }
                        style={{ alignSelf: 'stretch', marginHorizontal: 40 }}
                    >
                        <Text style={{ color: '#fff', alignSelf: 'center' }}>
                            {loading ? "Saving..."
                                : !pin ? "Drop a Pin First!"
                                : "Submit Incident"}
                        </Text>
                    </ThemedButton>

                    <OfflineActionModal visible={offlineModal} onClose={() => setOfflineModal(false)} />

                    <IncidentTypeModal
                        visible={typeModalOpen}
                        onClose={() => setTypeModalOpen(false)}
                        onSelect={(selected) => {
                            setType(selected)
                            setTypeModalOpen(false)
                        }}
                    />

                </ThemedView>
            </ScrollView>
        </TouchableWithoutFeedback>
    )
}

export default Create

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    input: {
        padding: 20,
        borderRadius: 6,
        alignSelf: 'center',
        marginHorizontal: 0,
        width: '90%'
    },
    multiline: {
        padding: 20,
        borderRadius: 6,
        minHeight: 120,
        alignSelf: 'center',
        textAlignVertical: 'top',
        width: '90%'
    },
    scroll: {
        flexGrow: 1,
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginBottom: 6,
        fontSize: 13,
    },
    mapContainer: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    pinHint: {
        fontSize: 13,
    },
    pinConfirm: {
        color: '#4caf50',
        fontSize: 13,
    },
    severityContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        borderRadius: 30,
        overflow: 'hidden',
        height: 44,
        width: '90%'
    },
    severitySegment: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,   // unselected dimmed
    },
    severitySelected: {
        opacity: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 1,
        borderWidth: 2,
        borderColor: '#000',
    },
    severityLeft: {
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
    },
    severityRight: {
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
    },
    severityText: {
        color: '#ddd',
        fontWeight: 'bold',
        fontSize: 14,
    },
})