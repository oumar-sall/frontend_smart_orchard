import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import axios from "axios";

const COLORS = {
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
};

const API_URL = 'http://192.168.1.15:3000';

interface AppHeaderProps {
  externalTemp?: number | null;
}

export default function AppHeader({ externalTemp = null }: AppHeaderProps) {
  const [internalTemp, setInternalTemp] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/readings/status`);
      setIsOnline(response.data.online);
    } catch (error) {
      console.warn("Erreur status Header:", error);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    // Statut en ligne
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 30000); // 30s

    // Météo
    if (externalTemp !== null) {
      setInternalTemp(externalTemp);
    } else {
      const fetchWeather = async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          let location = await Location.getCurrentPositionAsync({});
          const weatherRes = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_weather=true`
          );
          if (weatherRes.data && weatherRes.data.current_weather) {
            setInternalTemp(weatherRes.data.current_weather.temperature);
          }
        } catch (err) {
          console.warn("Erreur météo Header:", err);
        }
      };
      fetchWeather();
    }

    return () => {
      clearInterval(statusInterval);
    };
  }, [externalTemp]);

  const displayTemp = externalTemp !== null ? externalTemp : internalTemp;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.appName} numberOfLines={1}>Smart Orchard</Text>
          <Text style={styles.location} numberOfLines={1}>📍 Bamako, Mali</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={[styles.badge, styles.weatherBadge]}>
          <Text style={styles.badgeText}>
            {displayTemp !== null ? `☀️ ${Math.round(displayTemp)}°C` : '☀️ --°C'}
          </Text>
        </View>
        <View style={[styles.badge, styles.statusBadge, { borderColor: isOnline ? "#C8E6C9" : "#FFCDD2" }]}>
          <View style={[styles.onlineDot, { backgroundColor: isOnline ? "#4CAF50" : "#F44336" }]} />
          <Text style={styles.badgeText}>{isOnline ? "En ligne" : "Hors ligne"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A7C59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoEmoji: { fontSize: 20 },
  appName: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  location: { 
    fontSize: 11, 
    fontWeight: "600",
    color: COLORS.textSecondary, 
    marginTop: -1,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0EAE4",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  weatherBadge: {
    borderColor: "#FFE0B2",
  },
  statusBadge: {
    borderColor: "#C8E6C9",
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
});
