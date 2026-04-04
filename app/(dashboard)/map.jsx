import {useCallback, useEffect, useRef, useState} from "react"
import { StyleSheet, View, TouchableOpacity, Keyboard, Text } from 'react-native'
import MapView, { Marker, Circle, Polygon } from "react-native-maps"
import * as Location from "expo-location"

import { useIncidents } from "../../hooks/useIncidents"
import { useRoutes } from "../../hooks/useRoutes"
import { useDangerDetection } from "../../hooks/useDangerDetection"
import { useNetwork } from "../../hooks/useNetwork"
import { useTheme } from '../../contexts/ThemeContext'

import { CONCORDIA_BUILDINGS, SGW_CAMPUS_BOUNDARY, GUY_METRO } from '../../constants/Buildings'
import { Colors } from '../../constants/Colors'
import { SEVERITY_RADIUS } from '../../constants/Incidents'

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedLoader from '../../components/ThemedLoader'
import SearchBar from '../../components/SearchBar'
import RoutesOptions from '../../components/RoutesOptions'
import RouteResultsSheet from '../../components/RouteResultSheet'
import OfflineActionModal from '../../components/offline/OfflineActionModal'
import {useFocusEffect, useLocalSearchParams} from 'expo-router';
import {getDistance} from "../../lib/helpers";
import { IncidentIconMap } from '../../constants/Icons'
import { useRouter } from 'expo-router'
import {Ionicons} from "@expo/vector-icons";

const BUILDING_MARKER = require('../../assets/building_marker.png')

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
]

const Map = () => {
  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme] ?? Colors.light
  const { isOnline, checkOnline } = useNetwork()
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [destination, setDestination] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [safeZoneMessage, setSafeZoneMessage] = useState(null)
  const [navigatingToSafety, setNavigatingToSafety] = useState(false)
  const [routesDismissed, setRoutesDismissed] = useState(false)
  const [offlineModal, setOfflineModal] = useState(false)
  const originSnapshot = useRef(null)
  const mapRef = useRef(null)
  const router = useRouter()
  const { incidents } = useIncidents()
  const { routes } = useRoutes(navigatingToSafety ? originSnapshot.current : location, destination)
  const [alertTrigger, setAlertTrigger] = useState(0)

  const { alertIncidentId: _alertIncidentId, alertTrigger: _alertTrigger } = useLocalSearchParams()
  const rawAlertId = Array.isArray(_alertIncidentId) ? _alertIncidentId[0] : _alertIncidentId
  const rawTrigger = Array.isArray(_alertTrigger) ? _alertTrigger[0] : _alertTrigger

  const [alertIncidentId, setAlertIncidentId] = useState(rawAlertId)
  const [showSafeNowButton, setShowSafeNowButton] = useState(false)
  const [safeZoneExpanded, setSafeZoneExpanded] = useState(false)
  const [safeNowExpanded, setSafeNowExpanded] = useState(false)

  const {
    isUserInDangerZone,
    isDestinationInDangerZone,
    isSelectedRouteUnsafe,
  } = useDangerDetection({
    location,
    destination,
    routes,
    selectedRouteId,
    verifiedIncidents: incidents.filter(i => i.status !== 'resolved'),
    dangerRadius: SEVERITY_RADIUS,
  })

  const getNearestBuilding = () => {
    if (!location) return null
    let nearest = null
    let minDistance = Infinity
    CONCORDIA_BUILDINGS.forEach((building) => {
      const inDanger = incidents.some((incident) => {
        if (!incident.latitude || !incident.longitude) return false
        const dist = getDistance(
            building.latitude,
            building.longitude,
            incident.latitude,
            incident.longitude
        )
        return dist < (SEVERITY_RADIUS[incident.severity] ?? 75)
      })
      if (inDanger) return
      const distance = Math.pow(location.latitude - building.latitude, 2) + Math.pow(location.longitude - building.longitude, 2)
      if (distance < minDistance) { minDistance = distance; nearest = building }
    })
    return nearest
  }

// watch user location so danger detection stays current
  useEffect(() => {
    let watcher = null

    async function startWatcher() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Location permission denied')
        return
      }
      watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 10,
          },
          (pos) => setLocation(pos.coords)
      )
    }

    startWatcher()

    return () => watcher?.remove()
  }, [])

  // center on campus on mount
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.animateToRegion({
      latitude: GUY_METRO.latitude,
      longitude: GUY_METRO.longitude,
      latitudeDelta: 0.006,
      longitudeDelta: 0.006,
    }, 0)
  }, [])

  // zoom to incident when arriving from proximity alert or incident detail
  // slow path — runs when incidents load after map is already ready
  useEffect(() => {
    if (!rawAlertId || !incidents.length) return
    const incident = incidents.find(i => i.id === rawAlertId)
    if (!incident) return
    setAlertIncidentId(rawAlertId)
    setSelectedIncidentId(rawAlertId)
    setSelectedIncident(incident)
    mapRef.current?.animateToRegion({
      latitude: incident.latitude,
      longitude: incident.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 600)
  }, [rawAlertId, rawTrigger])

  // zoom to incident when tapping a marker
  const userTappedMarker = useRef(false)

  useEffect(() => {
    if (!selectedIncidentId || !mapRef.current) return
    if (!userTappedMarker.current) return  // only zoom on explicit tap
    userTappedMarker.current = false
    const incident = incidents.find(i => i.id === selectedIncidentId)
    if (!incident) return
    mapRef.current.animateToRegion({
      latitude: incident.latitude,
      longitude: incident.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    }, 600)
  }, [selectedIncidentId, incidents])

  // auto-select first route when routes load
  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRouteId(routes[0].id)
    }
  }, [routes])

  // fit map to selected route
  useEffect(() => {
    const selectedRoute = routes.find((r) => r.id === selectedRouteId)
    if (!selectedRoute || !mapRef.current) return
    mapRef.current.fitToCoordinates(selectedRoute.coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
      animated: true,
    })
  }, [selectedRouteId, routes])

  // clear state when out of danger zone
  useEffect(() => {
    if (!isUserInDangerZone && !navigatingToSafety) {
      setDestination(null)
      setSafeZoneMessage(null)
       setSafeZoneExpanded(false)
       setSafeNowExpanded(false)
    }
  }, [isUserInDangerZone])

  // clear callout if selected incident gets resolved via realtime
  useEffect(() => {
    if (!selectedIncident) return
    const updated = incidents.find(i => i.id === selectedIncident.id)
    if (!updated || updated.status === 'resolved') {
      setSelectedIncident(null)
      setSelectedIncidentId(null)
    }
  }, [incidents])

  useEffect(() => {
    if (navigatingToSafety && routes.length > 0) {
        const timer = setTimeout(() => {
            setShowSafeNowButton(true)
        }, 5000) // 10 seconds delay
        return () => clearTimeout(timer)
    } else {
        setShowSafeNowButton(false)
    }
}, [navigatingToSafety, routes.length])

  // clear selected incident when screen comes into focus from navigation
  useFocusEffect(
      useCallback(() => {
        if (!rawAlertId) {
          setSelectedIncident(null)
          setSelectedIncidentId(null)
          setAlertIncidentId(null)
        }
      }, [rawAlertId])
  )

  if (error) {
    return (
        <ThemedView style={styles.center}>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
    )
  }

  if (!location) {
    return (
        <ThemedView style={styles.center}>
          <ThemedLoader />
        </ThemedView>
    )
  }

  return (
      <ThemedView style={[styles.container, { padding: 0 }]}>

        {!isUserInDangerZone && (
            <>
              {isDestinationInDangerZone && (
                  <View style={styles.destinationWarningContainer}>
                    <ThemedText style={styles.destinationWarningText}>
                      ⚠ This destination is inside a reported danger zone.
                    </ThemedText>
                    <ThemedText style={styles.destinationSubText}>
                      We recommend choosing an alternative location.
                    </ThemedText>
                  </View>
              )}
              <SearchBar // in SearchBar onSelect handler in map.jsx
                  onSelect={(dest) => {
                    if (!isOnline) { setOfflineModal(true); return }
                    setDestination(dest)
                    setRoutesDismissed(false)
                  }}
                  onClear={() => setDestination(null)} />
            </>
        )}


        {/* MAP */}
        <MapView
            key={colorScheme}
            ref={mapRef}
            style={[styles.map]}
            userInterfaceStyle={colorScheme === 'dark' ? 'dark' : 'light'}
            customMapStyle={colorScheme === 'dark' ? DARK_MAP_STYLE : []}
            initialRegion={{
              latitude: GUY_METRO.latitude,
              longitude: GUY_METRO.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            }}
            showsUserLocation={true}
            showsPointsOfInterest={false}
            showsBuildings={false}
            showsMyLocationButton={true}
            zoomControlEnabled={true}
            onMapReady={() => {
              // fast path — map mounted after incidents already loaded
              if (!rawAlertId || !incidents.length) return
              const incident = incidents.find(i => i.id === rawAlertId)
              if (!incident) return
              setAlertIncidentId(rawAlertId)
              setSelectedIncidentId(rawAlertId)
              setSelectedIncident(incident)
              mapRef.current?.animateToRegion({
                latitude: incident.latitude,
                longitude: incident.longitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.003,
              }, 600)
            }}
            onPress={() => {
              setSelectedIncidentId(null)
              setSelectedIncident(null)
              setAlertIncidentId(null)
              Keyboard.dismiss()
            }}
        >
          {CONCORDIA_BUILDINGS.map((building) => (
              <Marker
                  key={building.name}
                  coordinate={{ latitude: building.latitude, longitude: building.longitude }}
                  title={building.name}
                  image={BUILDING_MARKER}
                  style={{ width: 16, height: 16 }}  // add this
              />
          ))}

          {incidents
              .filter((i) => i.latitude && i.longitude && i.status !== 'resolved')
              .map((incident) => (
                  <Marker
                      key={incident.id}
                      onPress={() => {
                        userTappedMarker.current = true
                        setSelectedIncident(incident)
                        setSelectedIncidentId(incident.id)
                      }}
                      coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
                      tracksViewChanges={true}
                  >
                    <View style={{ alignItems: 'center' }}>

                      {/* icon container */}
                      <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: Colors.severity[incident.severity],
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: selectedIncidentId === incident.id ? 3 : 2,
                            borderColor: selectedIncidentId === incident.id ? '#fcfcf9' : '#0b0b0b',
                            elevation: 8,
                          }}
                      >
                        {(() => {
                          const IconComponent = IncidentIconMap[incident.type] || IncidentIconMap['protest']
                          const sizeMap = {
                            protest: 22,
                            construction: 22,
                            blockade: 20,
                            vandalism: 24,
                          }
                          const iconSize = sizeMap[incident.type] || 20
                          return <IconComponent size={iconSize} color="#0b0a0a" />
                        })()}
                      </View>

                      {/* pointer */}
                      <View
                          style={{
                            width: 0,
                            height: 0,
                            borderLeftWidth: 6,
                            borderRightWidth: 6,
                            borderTopWidth: 10,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderTopColor: Colors.severity[incident.severity],
                            marginTop: -2,
                          }}
                      />
                    </View>
                  </Marker>
              ))
          }

          {incidents
              .filter((i) => i.latitude && i.longitude && i.status !== 'resolved' && (i.id === selectedIncidentId || i.id === alertIncidentId))
              .map((incident) => (
                  <Circle
                      key={`circle-${incident.id}`}
                      center={{ latitude: incident.latitude, longitude: incident.longitude }}
                      radius={SEVERITY_RADIUS[incident.severity] ?? 75}
                      fillColor={`${Colors.severity[incident.severity]}33`}
                      strokeColor={Colors.severity[incident.severity]}
                      strokeWidth={1}
                  />
              ))
          }

          <Polygon
              coordinates={SGW_CAMPUS_BOUNDARY}
              fillColor={`${Colors.primary}22`}
              strokeColor={Colors.primary}
              strokeWidth={2}
          />

          {!routesDismissed && (navigatingToSafety ? (
              <RoutesOptions
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
              />
          ) : (
              !isUserInDangerZone &&
              <RoutesOptions
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
              />
          ))}
        </MapView>

        {selectedIncident && (
            <TouchableOpacity
                style={[
                  styles.incidentCallout,
                  {
                    backgroundColor: theme.uiBackground,
                    borderLeftWidth: 2,
                    borderLeftColor: Colors.severity[selectedIncident.severity],
                    borderWidth: 2,
                    borderColor: Colors.severity[selectedIncident.severity],
                  }
                ]}
                onPress={() => {
                  setSelectedIncident(null)
                  setSelectedIncidentId(null)
                  setAlertIncidentId(null)
                  router.push(`/incidents/${selectedIncident.id}`)
                }}
                activeOpacity={0.9}
            >
              <View style={styles.calloutTop}>
                <View style={[styles.calloutSeverityDot, { backgroundColor: Colors.severity[selectedIncident.severity] }]} />
                <Text style={[styles.calloutTitle, { color: theme.title }]}>
                  {selectedIncident.type.charAt(0).toUpperCase() + selectedIncident.type.slice(1)}
                </Text>
                {selectedIncident.verified && (
                    <View style={[styles.calloutVerifiedBadge, { backgroundColor: Colors.badge.verifiedBg }]}>
                      <Text style={[styles.calloutVerifiedText, { color: Colors.badge.verified }]}>✓ Verified</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.calloutSeverity, { color: theme.text }]}>
                {selectedIncident.severity.charAt(0).toUpperCase() + selectedIncident.severity.slice(1)} Tension
                {selectedIncident.upvotes >= 4 ? ` · ${selectedIncident.upvotes} reports` : ''}
              </Text>
              <Text style={[styles.calloutHint, { color: Colors.primary }]}>Tap to view details</Text>
            </TouchableOpacity>
        )}
        {(isUserInDangerZone || navigatingToSafety) && (
            <>
              {safeZoneMessage && !navigatingToSafety && (
                  <View style={styles.warningContainer}>
                    <ThemedText style={styles.warningText}>
                      {safeZoneMessage}
                    </ThemedText>
                  </View>
              )}
              {navigatingToSafety && showSafeNowButton ? (
    safeNowExpanded ? (
        <View style={styles.safeZoneSplit}>
            <TouchableOpacity
                style={styles.safeZoneSplitAction}
                onPress={() => {
                    setDestination(null)
                    setNavigatingToSafety(false)
                    setSafeZoneMessage(null)
                    setSelectedRouteId(null)
                    setRoutesDismissed(true)
                    setShowSafeNowButton(false)
                    setSafeNowExpanded(false)
                }}
                activeOpacity={0.85}
            >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.safeZoneSplitText}>I'm Safe</Text>
            </TouchableOpacity>
            <View style={styles.safeZoneDivider} />
            <TouchableOpacity
                style={styles.safeZoneSplitDismiss}
                onPress={() => setSafeNowExpanded(false)}
            >
                <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    ) : (
        <TouchableOpacity
            style={styles.safeZoneCircle}
            onPress={() => setSafeNowExpanded(true)}
        >
            <Ionicons name="shield-checkmark" size={22} color="#fff" />
        </TouchableOpacity>
    )
                ) : !navigatingToSafety ? (
                    safeZoneExpanded ? (
                        <View style={styles.safeZoneSplit}>
                            <TouchableOpacity
                                style={styles.safeZoneSplitAction}
                                onPress={async () => {
                                    if (!isOnline) { setOfflineModal(true); return }
                                    const nearest = getNearestBuilding()
                                    if (nearest) {
                                        originSnapshot.current = location
                                        setDestination({ latitude: nearest.latitude, longitude: nearest.longitude })
                                        setNavigatingToSafety(true)
                                        setRoutesDismissed(false)
                                        setSafeZoneExpanded(false)
                                    } else {
                                        setSafeZoneMessage('⚠ All nearby buildings are in a danger zone. Please stay put.')
                                    }
                                }}
                            >
                                <Ionicons name="shield" size={18} color="#fff" />
                                <Text style={styles.safeZoneSplitText}>Safe Zone Now</Text>
                            </TouchableOpacity>
                            <View style={styles.safeZoneDivider} />
                            <TouchableOpacity
                                style={styles.safeZoneSplitDismiss}
                                onPress={() => setSafeZoneExpanded(false)}
                            >
                                <Ionicons name="close" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.safeZoneCircle}
                            onPress={() => setSafeZoneExpanded(true)}
                        >
                            <Ionicons name="shield" size={22} color="#fff" />
                        </TouchableOpacity>
                    )
                ) : null}
               </>
        )}

        {!isUserInDangerZone && !navigatingToSafety && !isDestinationInDangerZone && isSelectedRouteUnsafe && (
            <View style={styles.routeWarningContainer}>
              <ThemedText style={styles.routeWarningText}>
                ⚠ This route passes through a danger zone.
              </ThemedText>
              <ThemedText style={styles.routeSubText}>
                {routes.length > 1
                    ? 'We recommend choosing an alternative route.'
                    : 'No safer alternative routes were found. Please stay alert and consider changing your destination.'}
              </ThemedText>
            </View>
        )}

        {/* ROUTE SHEET */}
        {!isUserInDangerZone && !navigatingToSafety && routes.length > 0 && !routesDismissed && (
            <RouteResultsSheet
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                onDismiss={() => {
                  setRoutesDismissed(true)
                  setDestination(null)
                  setSelectedRouteId(null)
                }}
            />
        )}

        <OfflineActionModal visible={offlineModal} onClose={() => setOfflineModal(false)} />
      </ThemedView>
  )
}

export default Map


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  warningContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#FFF3CD",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 11,
  },

  warningText: {
    color: "#B45309",
    fontWeight: "bold",
    textAlign: "center",
  },

  safeZoneButton: {
  position: 'absolute',
  bottom: 32,
  left: 20,
  backgroundColor: '#27ae60',

  paddingHorizontal: 20,   // 👈 smaller
  paddingVertical: 10,     // 👈 smaller
  borderRadius: 22,

  flexDirection: 'row',    // 👈 for icon
  alignItems: 'center',
  gap: 6,

  elevation: 3,            // 👈 softer shadow
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},

  safeZoneButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},

  safeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  destinationWarningContainer: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 11,
  },

  destinationWarningText: {
    color: "#B91C1C",
    fontWeight: "bold",
    textAlign: "center",
  },

  destinationSubText: {
    color: "#7F1D1D",
    textAlign: "center",
    marginTop: 4,
  },

  routeWarningContainer: {
    position: "absolute",
    bottom: 260,
    alignSelf: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 5,
    zIndex: 20,
  },

  routeWarningText: {
    color: "#B91C1C",
    fontWeight: "bold",
    textAlign: "center",
  },

  routeSubText: {
    color: "#7F1D1D",
    textAlign: "center",
    marginTop: 4,
  },

  incidentCallout: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: '65%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20,
  },
  calloutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  calloutSeverityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111',
    flex: 1,
  },
  calloutVerifiedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  calloutVerifiedText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  calloutSeverity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  calloutHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  safeZoneCompact: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 6,
    zIndex: 20,
    shadowColor: '#27ae60',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  safeZoneCompactText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
  },
  safeZoneWarning: {
    position: 'absolute',
    bottom: 90, // 👈 sits just above button
    alignSelf: 'center',
    backgroundColor: '#FFF3CD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 6,
    zIndex: 20,
    width: '85%',
  },

  safeZoneWarningText: {
    color: '#B45309',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  safeZoneWarningSub: {
    color: '#7C2D12',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  safeExitNote: {
    position: 'absolute',
    bottom: 80, // 👈 sits above button
    alignSelf: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    elevation: 3,
    zIndex: 20,
  },

  safeExitNoteText: {
    color: '#1B5E20',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  safeZoneCircle: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 20,
    shadowColor: '#27ae60',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
},
safeZoneSplit: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 26,
    elevation: 6,
    zIndex: 20,
    overflow: 'hidden',
    shadowColor: '#27ae60',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
},
safeZoneSplitAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
},
safeZoneSplitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
},
safeZoneDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
},
safeZoneSplitDismiss: {
    paddingHorizontal: 14,
    paddingVertical: 14,
},

})