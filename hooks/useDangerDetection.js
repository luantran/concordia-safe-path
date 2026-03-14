import { useMemo } from "react"

export const useDangerDetection = ({
  location,
  destination,
  routes,
  selectedRouteId,
  verifiedIncidents,
  dangerRadius,
}) => {

  /* ===============================
     Distance Helper
  =============================== */
  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000
    const toRad = (value) => (value * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }


  /* ===============================
     Route Safety Check
  =============================== */
  const isRouteUnsafe = (route) => {
  if (!route) return false

  return route.coordinates.some(point =>
    verifiedIncidents.some(incident => {

      const radius = dangerRadius[incident.severity] || 40

      const distance = getDistanceInMeters(
        point.latitude,
        point.longitude,
        incident.latitude,
        incident.longitude
      )

      return distance < radius
    })
  )
}


  /* ===============================
     Derived Safety States
  =============================== */

  const isUserInDangerZone = useMemo(() => {
  if (!location) return false

  return verifiedIncidents.some(incident => {

    const radius = dangerRadius[incident.severity] || 40

    const distance = getDistanceInMeters(
      location.latitude,
      location.longitude,
      incident.latitude,
      incident.longitude
    )

    return distance < radius
  })
}, [location, verifiedIncidents, dangerRadius])

  const isDestinationInDangerZone = useMemo(() => {
  if (!destination) return false

  return verifiedIncidents.some(incident => {

    const radius = dangerRadius[incident.severity] || 40

    const distance = getDistanceInMeters(
      destination.latitude,
      destination.longitude,
      incident.latitude,
      incident.longitude
    )

    return distance < radius
  })
}, [destination, verifiedIncidents, dangerRadius])

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId),
    [routes, selectedRouteId]
  )

  const isSelectedRouteUnsafe = useMemo(
    () => selectedRoute && isRouteUnsafe(selectedRoute),
    [selectedRoute, verifiedIncidents]
  )

  return {
    isUserInDangerZone,
    isDestinationInDangerZone,
    isSelectedRouteUnsafe,
  }
}