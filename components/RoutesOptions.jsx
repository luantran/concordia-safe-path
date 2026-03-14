import { Polyline } from "react-native-maps";

const RoutesOptions = ({ routes, selectedRouteId, onSelectRoute }) => {
  return (
    <>
      {routes.map((route, index) => {
        const isSelected = route.id === selectedRouteId;

        return (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={isSelected ? "#2ecc71" : "#95a5a6"}
            strokeWidth={isSelected ? 6 : 3}
            tappable
            onPress={() => onSelectRoute(route.id)}
          />
        );
      })}
    </>
  );
};

export default RoutesOptions;