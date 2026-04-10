import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Colors } from "../constants/Colors";

const RouteResultsSheet = ({ routes, selectedRouteId, onSelectRoute, onDismiss }) => {
  const { colorScheme } = useTheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const isDark = colorScheme === 'dark'

  if (!routes || routes.length === 0) return null;

  return (
      <View style={[styles.container, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: theme.title }]}>Available Safe Paths</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={[styles.dismiss, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {routes.map((route, index) => {
            const isSelected = route.id === selectedRouteId;

            return (
                <TouchableOpacity
                    key={route.id}
                    style={[
                      styles.routeItem,
                      {
                        backgroundColor: isDark ? '#2f2b3d' : '#f5f5f5',
                        borderWidth: 1,
                        borderColor: isDark ? '#4a4560' : 'transparent',
                      },
                      isSelected && {
                        backgroundColor: isDark ? '#1a3a2a' : '#d6f5e3',
                        borderWidth: 1,
                        borderColor: '#2ecc71',
                      },
                    ]}
                    onPress={() => onSelectRoute(route.id)}
                >
                  <Text style={[styles.routeTitle, { color: theme.title }]}>
                    Path {index + 1}
                  </Text>
                  <Text style={[styles.routeDetails, { color: theme.text }]}>
                    {route.duration} • {route.distance}
                  </Text>
                </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
  );
};

export default RouteResultsSheet;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dismiss: {
    fontSize: 16,
    padding: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
  },
  routeItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedRoute: {
    backgroundColor: "#d6f5e3",
    borderWidth: 1,
    borderColor: "#2ecc71",
  },
  routeTitle: {
    fontWeight: "600",
  },
  routeDetails: {
    marginTop: 4,
  },
});