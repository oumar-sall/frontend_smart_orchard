import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import * as Location from "expo-location";
import CircularGauge from "../../components/CircularGauge";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 3; // 20px padding * 2 + 16px gap * 2 = 72px
const GAUGE_SIZE = (width - 120) / 3; // Scale gauge to fit well

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#2C2C2C",
  textSecondary: "#888",
  labelColor: "#6B6B6B",
};

// URL de l'API de votre backend. A modifier si vous êtes sur appareil physique.
// Pour iOS via Expo Go (appareil physique sur même WiFi), il faut l'IP locale de l'ordinateur.
const API_URL = 'http://192.168.1.14:3000';

function AppHeader({ externalTemp }: { externalTemp: number | null }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <View>
          <Text style={styles.appName}>Smart Orchard</Text>
          <Text style={styles.location}>📍 Verger Nord - Bamako</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.tempBadge}>
          <Text style={styles.tempText}>
            {externalTemp !== null ? `☀️ ${externalTemp}°C` : '☀️ --°C'}
          </Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>En ligne</Text>
        </View>
      </View>
    </View>
  );
}

function MetricCard({
  title,
  value,
  unit,
  min = 0,
  max = 100,
  color = COLORS.green
}: {
  title: string;
  value: string | number;
  unit?: string;
  min?: number;
  max?: number;
  color?: string;
}) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isAvailable = !isNaN(numValue) && value !== '--';

  return (
    <View style={styles.metricCard}>
      <View style={styles.gaugeContainer}>
        <CircularGauge
          value={isAvailable ? numValue : 0}
          min={min}
          max={max}
          color={color}
          size={GAUGE_SIZE}
          unit={unit}
          strokeWidth={8}
        />
      </View>

      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState({ temperature: '--', humidity: '--', ph: '--' });
  const [externalTemp, setExternalTemp] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/readings/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erreur récupération données dashboard: ", error);
    }
  };

  const fetchExternalTemp = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      // Appel à l'API open-meteo (gratuite sans clé) avec la géolocalisation de l'appareil
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_weather=true`);
      if (weatherRes.data && weatherRes.data.current_weather) {
        setExternalTemp(weatherRes.data.current_weather.temperature);
      }
    } catch (err) {
      console.error("Erreur météo externe: ", err);
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchDashboardData();
      await fetchExternalTemp();
      setLoading(false);
    }
    loadAll();

    // Optionnel: Refresh toutes les 30 sec
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <AppHeader externalTemp={externalTemp} />

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.sectionTitle}>État du sol</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.metricsGrid}>
            <View style={styles.gridRow}>
              <MetricCard
                title="Humidité"
                value={dashboardData.humidity}
                unit="%"
                color="#4A90E2"
                min={0}
                max={100}
              />

              <MetricCard
                title="PH"
                value={dashboardData.ph === "ici sera mis la valeur lue du capteur de ph" ? "--" : dashboardData.ph}
                unit="pH"
                color="#9B51E0"
                min={0}
                max={14}
              />

              <MetricCard
                title="Température"
                value={dashboardData.temperature}
                unit="°C"
                color="#F2994A"
                min={0}
                max={50}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },

  // Header
  // ... (Garde les anciens styles header intacts) ...
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 42,
    height: 42,
    backgroundColor: "#DFF0E0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 22 },
  appName: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  location: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  tempBadge: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E0D8",
  },
  tempText: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E0D8",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  onlineText: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },

  // Dashboard Specific
  dashboardTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 8,
    paddingTop: 12,
    width: CARD_WIDTH,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  metricHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.labelColor,
    textAlign: 'center',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
