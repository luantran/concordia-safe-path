import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'

//themed components
import ThemedText from '../../components/ThemedText'
import ThemedView from '../../components/ThemedView'
import IncidentCard from '../../components/incident/IncidentCard'

//hooks
import { useIncidents } from '../../hooks/useIncidents'

//functions
import { getDistance } from '../../lib/helpers'

// Constants
import { Colors } from '../../constants/Colors'


const SEVERITIES = ['high', 'medium', 'low']

const Incidents = () => {
    const { incidents, fetchIncidents } = useIncidents()
    const router = useRouter()
    const [filter, setFilter] = useState(null)
    const [sortBy, setSortBy] = useState('time')
    const [filtersExpanded, setFiltersExpanded] = useState(false)

    const [userCoords, setUserCoords] = useState(null)
    const [refreshing, setRefreshing] = useState(false)


    // Request location for distance sorting
    useEffect(() => {
        async function getLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return
            const current = await Location.getCurrentPositionAsync({})
            setUserCoords(current.coords)
        }
        getLocation()
    }, [])

    async function onRefresh() {
        setRefreshing(true)
        try {
            await fetchIncidents()
        } finally {
            setRefreshing(false)
        }
    }

    // Filter by severity if set
    const filtered = filter
        ? incidents.filter(i => i.severity === filter)
        : incidents

    // Sort function — by time or distance
    const sortFn = (a, b) => {
        if (sortBy === 'distance' && userCoords) {
            return getDistance(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude)
                - getDistance(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude)
        }
        return new Date(b.created_at) - new Date(a.created_at)
    }

    const ongoing = filtered.filter(i => i.status === 'active').sort(sortFn)
    const resolved = filtered.filter(i => i.status === 'resolved').sort(sortFn)

    return (
        <ThemedView style={styles.container}>

            {/* Collapsible filter/sort toggle */}
            <Pressable
                style={styles.filterToggle}
                onPress={() => setFiltersExpanded(!filtersExpanded)}
            >
                <Ionicons name="options-outline" size={16} color={Colors.primary} />
                <ThemedText style={[styles.pillText, { color: Colors.primary }]}>Filters & Sort</ThemedText>
                <Ionicons
                    name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.primary}
                    style={{ marginLeft: 'auto' }}
                />
            </Pressable>

            {filtersExpanded && (
                <>
                    {/* Severity filter */}
                    <View style={styles.filterRow}>
                        <ThemedText style={styles.filterLabel}>Filters:</ThemedText>
                        <View style={styles.pillGroup}>
                            {SEVERITIES.map((s) => (
                                <Pressable
                                    key={s}
                                    onPress={() => setFilter(filter === s ? null : s)}
                                    style={[
                                        styles.pill,
                                        { borderColor: Colors.severity[s] },
                                        filter === s && { backgroundColor: Colors.severity[s] }
                                    ]}
                                >
                                    <ThemedText style={[styles.pillText, filter === s && { color: Colors.black }]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Sort toggle */}
                    <View style={styles.filterRow}>
                        <ThemedText style={styles.filterLabel}>Sort by:</ThemedText>
                        <View style={styles.pillGroup}>
                            {['time', 'distance'].map((s) => (
                                <Pressable
                                    key={s}
                                    onPress={() => setSortBy(s)}
                                    style={[
                                        styles.pill,
                                        { borderColor: Colors.primary },
                                        sortBy === s && { backgroundColor: Colors.primary }
                                    ]}
                                >
                                    <Ionicons
                                        name={s === 'time' ? 'time-outline' : 'location-outline'}
                                        size={14}
                                        color={sortBy === s ? Colors.white : Colors.primary}
                                    />
                                    <ThemedText style={[styles.pillText, { color: sortBy === s ? Colors.white : Colors.primary }]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </>
            )}

            <FlatList
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                data={resolved}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    ongoing.length === 0
                        ? <ThemedText style={styles.empty}>No incidents reported.</ThemedText>
                        : null
                }
                ListHeaderComponent={
                    <>
                        {ongoing.length > 0 && (
                            <>
                                {/* Ongoing section header */}
                                <View style={styles.sectionHeader}>
                                    <View style={styles.dot} />
                                    <ThemedText style={styles.sectionTitle}>ONGOING INCIDENTS</ThemedText>
                                </View>
                                {ongoing.map((item) => (
                                    <IncidentCard
                                        key={item.id}
                                        item={item}
                                        onPress={() => router.push(`/incidents/${item.id}`)}
                                    />
                                ))}
                                <View style={styles.sectionDivider} />
                                {/* Ongoing section header */}
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="shield-checkmark-outline" size={14} color={Colors.badge.verified} />
                                    <ThemedText style={styles.sectionTitle}>RESOLVED INCIDENTS</ThemedText>
                                </View>
                            </>
                        )}
                    </>
                }
                renderItem={({ item }) => (
                    <IncidentCard
                        item={item}
                        onPress={() => router.push(`/incidents/${item.id}`)}
                    />
                )}
            />
        </ThemedView>
    )
}

export default Incidents

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.divider,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
    },
    filterLabel: {
        fontSize: 14,
        opacity: 0.6,
        marginRight: 4,
    },
    pillGroup: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // ─── List ──────────────────────────────────────────────────────────────────
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        marginTop: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        opacity: 0.7,
        letterSpacing: 0.5,
    },
    sectionDivider: {
        height: 10,
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
})