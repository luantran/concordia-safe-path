import { useEffect, useState } from "react";
import polyline from "@mapbox/polyline";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY;

export const useRoutes = (origin, destination) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=walking&alternatives=true&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();
        console.log("Google raw routes count:", data.routes.length);
        

        if (data.status !== "OK") {
          throw new Error(data.status);
        }

        const formattedRoutes = data.routes.map((route, index) => {
          const decodedPoints = polyline.decode(
            route.overview_polyline.points
          );

          const coordinates = decodedPoints.map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }));

          return {
            id: `route-${index}`,
            duration: route.legs[0].duration.text,
            distance: route.legs[0].distance.text,
            coordinates,
          };
        });

        setRoutes(formattedRoutes);
        setLoading(false);
      } catch (err) {
        console.log("Directions API Error:", err.message);
        setError("Failed to fetch routes");
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [origin, destination]);

  return { routes, loading, error };
};