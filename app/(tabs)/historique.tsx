import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import HistoryCard from "../../components/HistoryCard";

const { width } = Dimensions.get('window');
const SUMMARY_CARD_WIDTH = (width - 56) / 3;

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  activeGreen: "#4A7C59",
  inactiveBtn: "#FFFFFF",
};

const API_URL = 'http://192.168.1.15:3000';

function SummaryCard({ title, value, unit, icon, color }: { title: string, value: string | number, unit?: string, icon: string, color: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>{String(value)}{unit}</Text>
      <Text style={styles.summaryLabel}>{title}</Text>
    </View>
  );
}

export default function HistoriqueScreen() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState({ temp: '--', hum: '--', ph: '--' });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/readings/history?period=${selectedPeriod}`);
      setHistoryData(response.data);

      // Calculate global averages for the period
      const data = response.data;
      if (data.length > 0) {
        const validTemp = data.filter((d: any) => d.avgTemperature !== '--').map((d: any) => d.avgTemperature);
        const validHum = data.filter((d: any) => d.avgHumidity !== '--').map((d: any) => d.avgHumidity);
        const validPh = data.filter((d: any) => d.avgPh !== '--').map((d: any) => parseFloat(d.avgPh));

        setAverages({
          temp: validTemp.length ? String(Math.round(validTemp.reduce((a: any, b: any) => a + b, 0) / validTemp.length)) : '--',
          hum: validHum.length ? String(Math.round(validHum.reduce((a: any, b: any) => a + b, 0) / validHum.length)) : '--',
          ph: validPh.length ? (validPh.reduce((a: any, b: any) => a + b, 0) / validPh.length).toFixed(1) : '--'
        });
      }
    } catch (error) {
      console.error("Erreur récupération historique: ", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedPeriod === 'week' && styles.filterBtnActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={selectedPeriod === 'week' ? styles.filterBtnTextActive : styles.filterBtnText}>Semaine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, selectedPeriod === 'month' && styles.filterBtnActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={selectedPeriod === 'month' ? styles.filterBtnTextActive : styles.filterBtnText}>Mois</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            title="MOY. HUMID."
            value={averages.hum}
            unit="%"
            icon="water-outline"
            color="#4A90E2"
          />
          <SummaryCard
            title="MOY. PH"
            value={averages.ph}
            icon="flask-outline"
            color="#9B51E0"
          />
          <SummaryCard
            title="MOY. TEMP."
            value={averages.temp}
            unit="°"
            icon="thermometer-outline"
            color="#F2994A"
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedPeriod === 'week' ? 'DONNÉES DE LA SEMAINE' : 'DONNÉES DU MOIS'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        ) : (
          historyData.map((day, idx) => (
            <HistoryCard
              key={day.date}
              displayDate={day.displayDate}
              avgHumidity={day.avgHumidity}
              avgPh={day.avgPh}
              avgTemperature={day.avgTemperature}
              wateringCount={day.wateringCount}
              humidityTrend={day.humidityTrend}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },

  titleRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: "#77967C",
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#717171",
  },
  filterBtnTextActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    width: SUMMARY_CARD_WIDTH,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
});
