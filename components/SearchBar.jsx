import React from "react";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SEARCH_LOCATIONS } from "../constants/SearchBarLocations";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
const SearchBar = ({ onSelect }) => {

  // Convert your buildings into Google predefined format
  const campusPlaces = SEARCH_LOCATIONS.map((location) => ({
    description: location.name,
    geometry: {
      location: {
        lat: location.latitude,
        lng: location.longitude,
      },
    },
  }));

  return (
    <View style={{ position: "absolute", top: 60, width: "100%", zIndex: 20 }}>
      <GooglePlacesAutocomplete
        placeholder="Search any address"
        fetchDetails={true}
        debounce={200}
        enablePoweredByContainer={true}

        /* 🔹 When user selects GOOGLE result */
        onPress={(data, details = null) => {
          if (!details) return;

          const location = details.geometry.location;

          onSelect({
            latitude: location.lat,
            longitude: location.lng,
          });
        }}

        /* 🔹 Your default campus buildings */
        predefinedPlaces={campusPlaces}

        /* 🔹 When user selects DEFAULT building */
        onPressPredefined={(place) => {
          onSelect({
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          });
        }}

        query={{
          key: GOOGLE_API_KEY,
          language: "en",
          components: "country:ca",
          location: "45.495,-73.578",
          radius: 1500,
        }}

        styles={{
          container: { flex: 0 },
          textInput: {
            marginHorizontal: 16,
            borderRadius: 12,
            height: 50,
            paddingHorizontal: 15,
            backgroundColor: "white",
          },
        }}
      />
    </View>
  );
};

export default SearchBar;