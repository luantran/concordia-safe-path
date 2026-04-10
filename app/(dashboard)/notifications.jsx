import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native'
import { useRouter} from 'expo-router'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedCard from '../../components/ThemedCard'
import ThemedLoader from '../../components/ThemedLoader'
import { useNotificationsContext } from '../../contexts/NotificationsContext'
import { INCIDENT_TYPES } from '../../constants/Incidents'
import { Colors } from '../../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { IncidentIconMap } from '../../constants/Icons'

import { getNearestBuilding } from '../../lib/helpers'

const Notifications = () => {
    const INCIDENT_TYPE_MAP = Object.fromEntries(
        (INCIDENT_TYPES ?? []).map(t => [t.value, t])
    )
    const router = useRouter()
    const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotificationsContext()

    const handlePress = async (notification) => {
        if (!notification.read) await markAsRead(notification.id)
        router.push({
            pathname: `/incidents/${notification.incident_id}`,
            params: {
                fromTab: 'notifications',
            }
        })
    }

    const renderItem = ({ item }) => {
        const incident = item.incidents
        if (!incident) return null

        const incidentConfig = INCIDENT_TYPE_MAP[incident.type] ?? {}
        const severityColor = Colors.severity[incident.severity] ?? '#888'
        const isVerified = incident.verification_status === 'verified_by_campus' || incident.verified

        return (
            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.7}>
                <ThemedCard style={[styles.card, !item.read && styles.unread]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: severityColor }]}>
                        {IncidentIconMap[incident.type]
                            ? IncidentIconMap[incident.type]({ size: 24, color: '#fff' })
                            : <Ionicons name="alert-circle" size={24} color="#fff" />}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <ThemedText style={styles.title}>
                            {incidentConfig.label ?? incident.type}
                        </ThemedText>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#888" />
                            <ThemedText style={styles.location}>
                                {incident.latitude && incident.longitude
                                    ? getNearestBuilding(incident.latitude, incident.longitude)
                                    : 'Near campus'}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.message}>
                            {item.message}
                        </ThemedText>
                        <ThemedText style={[styles.severity, { color: severityColor }]}>
                            {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                            {isVerified ? ' • Verified' : ''}
                        </ThemedText>
                    </View>

                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={18} color="#aaa" />
                </ThemedCard>
            </TouchableOpacity>
        )
    }

    if (loading) return <ThemedLoader />

    return (
        <ThemedView style={styles.container} safe={true}>

            {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllContainer}>
                    <ThemedText style={styles.markAll}>Mark all read</ThemedText>
                </TouchableOpacity>
            )}

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <ThemedText style={styles.empty}>No notifications yet.</ThemedText>
                }
                contentContainerStyle={styles.list}
            />
        </ThemedView>
    )
}

export default Notifications

const styles = StyleSheet.create({
    container: { flex: 1 },
    markAllContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: '5%',
        paddingVertical: 6,
    },
    markAll: {
        fontSize: 13,
        color: Colors.primary,
    },
    list: { paddingBottom: 20 },
    card: {
        marginHorizontal: '5%',
        marginVertical: 6,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    unread: {
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1, gap: 3 },
    title: { fontWeight: 'bold', fontSize: 14 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    location: { fontSize: 12, color: '#888' },
    message: { fontSize: 12, color: Colors.primary, fontStyle: 'italic' },
    severity: { fontSize: 12, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 60, opacity: 0.5 },
})