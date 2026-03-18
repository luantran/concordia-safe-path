import { StyleSheet, FlatList, View, Pressable } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'

import { useIncidents } from '../../hooks/useIncidents'
import { Colors } from '../../constants/Colors'
import { CONCORDIA_BUILDINGS } from '../../constants/Buildings'



const getIcon = (type) => {
  switch (type) {
    case 'protest':
      return 'bullhorn'
    case 'construction':
      return 'excavator'
    case 'vandalism':
      return 'hammer'
    case 'road blockage':
      return 'block-helper'
    default:
      return 'alert'
  }
}

const getNearestLocationName = (lat, lng) => {
  if (!lat || !lng) return 'Near Concordia Campus'

  let nearest = null
  let minDist = Infinity

  CONCORDIA_BUILDINGS.forEach((b) => {
    const dist =
      Math.pow(lat - b.latitude, 2) +
      Math.pow(lng - b.longitude, 2)

    if (dist < minDist) {
      minDist = dist
      nearest = b
    }
  })

  return nearest ? `Near ${nearest.name}` : 'Near Concordia Campus'
}


const Notifications = () => {
  const { incidents } = useIncidents()
  const router = useRouter()

  // ✅ ONLY VERIFIED INCIDENTS
  const notifications = incidents
    .filter(i => i.verified)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <ThemedView style={styles.container} safe>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            No notifications yet.
          </ThemedText>
        }

        renderItem={({ item }) => {
          const color = Colors.severity[item.severity]
          const icon = getIcon(item.type)

          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push(`/map?alertIncidentId=${item.id}`)}
            >

              {/* LEFT ICON */}
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={icon} size={22} color="white" />
              </View>

              {/* TEXT */}
              <View style={styles.textContainer}>

                {/* TITLE */}
                <ThemedText style={styles.title}>
                  {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                </ThemedText>

                {/* LOCATION */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#777" />
                  <ThemedText style={styles.location}>
                    {item.location || getNearestLocationName(item.latitude, item.longitude)}
                  </ThemedText>
                </View>

                {/* SEVERITY */}
                <ThemedText style={[styles.severity, { color }]}>
                  {item.severity?.charAt(0).toUpperCase() + item.severity?.slice(1)}
                </ThemedText>
              </View>

              {/* RIGHT ARROW */}
              <Ionicons name="chevron-forward" size={20} color="#999" />

            </Pressable>
          )
        }}
      />
    </ThemedView>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  location: {
    fontSize: 12,
    marginLeft: 4,
    color: '#6B7280',
  },

  severity: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },

  empty: {
    textAlign: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
})