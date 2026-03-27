import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import CircularGauge from "../../components/CircularGauge";
import AppHeader from "../../components/AppHeader";
import { API_URL } from "@/constants/Api";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 3;
const GAUGE_SIZE = (width - 120) / 3;

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  labelColor: "#555555",
};

function MetricCard({
  title,
  value,
  unit,
  min = 0,
  max = 100,
  color = COLORS.green
}: any) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isAvailable = !isNaN(numValue) && value !== '--';

  return (
    <View style={styles.metricCard}>
      <View style={styles.gaugeContainer}>
        <CircularGauge
          value={isAvailable ? numValue : NaN}
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

function IrrigationCard({
  actuator,
  onToggle,
  loading
}: {
  actuator: any;
  onToggle: (id: string, currentAction: string) => void;
  loading: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const isIrrigatingElement = actuator.active;

  useEffect(() => {
    let interval: any;
    if (actuator.active && actuator.timerEnd) {
      const end = new Date(actuator.timerEnd).getTime();
      const updateTimer = () => {
        const diff = Math.floor((end - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [actuator.active, actuator.timerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.irrigationCard, isIrrigatingElement && styles.irrigationCardActive]}
      activeOpacity={0.9}
      onPress={() => onToggle(actuator.id, actuator.active ? 'close' : 'open')}
      disabled={loading}
    >
      <View style={styles.irrigationMainRow}>
        <View style={styles.irrigationIconBox}>
          <Ionicons
            name={actuator.label.toLowerCase().includes('vanne') ? "water-outline" : "construct-outline"}
            size={24}
            color="#4A7C59"
          />
        </View>
        <View style={styles.irrigationTextContainer}>
          <Text style={styles.irrigationTitle}>{actuator.label}</Text>
          <Text style={styles.irrigationSub}>
            {isIrrigatingElement ? 'Irrigation en cours...' : 'Appuyez pour démarrer'}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#4A7C59" />
        ) : (
          <View style={[styles.toggleTrack, isIrrigatingElement && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, isIrrigatingElement && styles.toggleThumbActive]}>
              <Ionicons
                name={isIrrigatingElement ? "power" : "power-outline"}
                size={14}
                color={isIrrigatingElement ? "#4A7C59" : "#ADB5BD"}
              />
            </View>
          </View>
        )}
      </View>

      {isIrrigatingElement && timeLeft !== null && timeLeft > 0 && (
        <View style={styles.timerSection}>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.timerUnit}>restantes</Text>
        </View>
      )}

      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
    </TouchableOpacity>
  );
}

const getSensorColor = (value: number, unit: string, min: number, max: number) => {
  if (isNaN(value)) return COLORS.green; // Default
  
  const minColor = { r: 74, g: 144, b: 226 };  // Blue (#4A90E2)
  const maxColor = { r: 255, g: 59, b: 48 };   // Red (#FF3B30)

  const interpolate = (ratio: number) => {
    let constrained = Math.max(0, Math.min(1, ratio));
    const r = Math.round(minColor.r + (maxColor.r - minColor.r) * constrained);
    const g = Math.round(minColor.g + (maxColor.g - minColor.g) * constrained);
    const b = Math.round(minColor.b + (maxColor.b - minColor.b) * constrained);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (unit === '°C') {
    // Low: Blue, High: Red
    const ratio = (max - min) === 0 ? 0 : (value - min) / (max - min);
    return interpolate(ratio);
  } else if (unit === '%') {
    // Low: Red, High: Blue
    const ratio = (max - min) === 0 ? 0 : (value - min) / (max - min);
    return interpolate(1 - ratio);
  } else if (unit === 'pH') {
    // 7 is Blue (0), 0 or 14 is Red (1)
    const ratio = Math.abs(value - 7) / 7;
    return interpolate(ratio);
  }
  return COLORS.green;
};

const getSensorLabel = (label: string, unit: string) => {
  if (unit === '°C') return "Température";
  if (unit === '%') return "Humidité";
  if (unit === 'pH') return "pH";
  return label || "Capteur";
};

export default function DashboardScreen() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>({
    sensors: [],
    actuators: []
  });
  const [externalTemp, setExternalTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [irrigationLoadingId, setIrrigationLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const controllerId = await SecureStore.getItemAsync('selectedControllerId');
      if (!controllerId) return;

      const response = await axios.get(`${API_URL}/readings/dashboard`, {
        params: { controller_id: controllerId }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erreur récupération données dashboard: ", error);
    }
  };

  const fetchExternalTemp = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_weather=true`);
      if (weatherRes.data && weatherRes.data.current_weather) {
        setExternalTemp(weatherRes.data.current_weather.temperature);
      }
    } catch (err) {
      console.error("Erreur météo externe: ", err);
    }
  }

  const handleToggleIrrigation = async (componentId: string, action: string) => {
    setIrrigationLoadingId(componentId);
    try {
      const response = await axios.post(`${API_URL}/readings/irrigation`, {
        action,
        componentId
      });
      if (response.data.success) {
        await fetchDashboardData();
        Alert.alert("Succès", `Commande ${action === 'open' ? 'ouverte' : 'fermée'} envoyée.`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Erreur lors de la commande";
      Alert.alert("Erreur", errorMsg);
    } finally {
      setIrrigationLoadingId(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const checkAndFetch = async () => {
        const id = await SecureStore.getItemAsync('selectedControllerId');
        if (!id) {
          router.replace("/controllers" as any);
        } else {
          fetchDashboardData();
        }
      };
      checkAndFetch();
    }, [router])
  );

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchExternalTemp();
      // fetchDashboardData est déjà appelé par useFocusEffect
      setLoading(false);
    }
    loadAll();

    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader externalTemp={externalTemp} />

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.sectionTitle}>État du sol</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.metricsGrid}>
            {dashboardData.sensors && dashboardData.sensors.map((sensor: any) => (
              <MetricCard 
                key={sensor.id}
                title={getSensorLabel(sensor.title, sensor.unit)} 
                value={sensor.value} 
                unit={sensor.unit} 
                color={getSensorColor(sensor.value, sensor.unit, sensor.min, sensor.max)} 
                min={sensor.min}
                max={sensor.max}
              />
            ))}
            {(!dashboardData.sensors || dashboardData.sensors.length === 0) && (
              <Text style={{ marginTop: 10, color: COLORS.textSecondary, fontStyle: 'italic' }}>Aucune donnée de capteur trouvée.</Text>
            )}
          </View>
        )}

        <View style={styles.irrigationContainer}>
          <Text style={styles.sectionTitle}>Contrôle des équipements</Text>
          {dashboardData.actuators && dashboardData.actuators.map((act: any) => (
            <IrrigationCard
              key={act.id}
              actuator={act}
              onToggle={handleToggleIrrigation}
              loading={irrigationLoadingId === act.id}
            />
          ))}
          {(!dashboardData.actuators || dashboardData.actuators.length === 0) && !loading && (
            <Text style={{ marginTop: 20, color: COLORS.textSecondary, fontStyle: 'italic' }}>Aucun équipement configuré.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },
  dashboardTitleContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
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
  metricHeader: { flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 },
  metricTitle: { fontSize: 10, fontWeight: '700', color: COLORS.labelColor, textAlign: 'center' },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center' },
  irrigationContainer: { marginTop: 24 },
  irrigationCard: {
    backgroundColor: '#F3F5F0',
    borderRadius: 28,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8EBE3',
    overflow: 'hidden',
    position: 'relative',
  },
  irrigationCardActive: { backgroundColor: '#EAF2EC', borderColor: '#D5E6DA' },
  irrigationMainRow: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  irrigationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  irrigationTextContainer: { flex: 1 },
  irrigationTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  irrigationSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  toggleTrack: { width: 64, height: 36, borderRadius: 18, backgroundColor: '#E9ECEF', padding: 4 },
  toggleTrackActive: { backgroundColor: '#4A7C59' },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  timerSection: { marginTop: 30, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, zIndex: 2 },
  timerDisplay: { backgroundColor: '#E9ECEF', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20, minWidth: 160, alignItems: 'center' },
  timerValue: { fontSize: 36, fontWeight: '800', color: '#4A7C59', letterSpacing: 2 },
  timerUnit: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  decoCircle1: { position: 'absolute', right: -20, bottom: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(74, 124, 89, 0.03)', zIndex: 1 },
  decoCircle2: { position: 'absolute', right: 20, bottom: -60, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(74, 124, 89, 0.03)', borderWidth: 1, borderColor: 'rgba(74, 124, 89, 0.05)', zIndex: 1 }
});
