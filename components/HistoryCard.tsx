import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HistoryCardProps {
  displayDate: string;
  avgHumidity: number | string;
  avgPh: number | string;
  avgTemperature: number | string;
  wateringCount: number;
  humidityTrend?: 'up' | 'down' | 'stable';
}

const COLORS = {
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  blue: "#4A90E2",
  purple: "#9B51E0",
  orange: "#F2994A",
  badgeBg: "#F0F4F1",
};

export default function HistoryCard({
  displayDate,
  avgHumidity,
  avgPh,
  avgTemperature,
  wateringCount,
  humidityTrend = 'stable'
}: HistoryCardProps) {
  
  const renderTrend = () => {
    if (humidityTrend === 'up') return <Ionicons name="trending-up-outline" size={12} color="#4CAF50" style={styles.trendIcon} />;
    if (humidityTrend === 'down') return <Ionicons name="trending-down-outline" size={12} color="#F44336" style={styles.trendIcon} />;
    return null;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{displayDate}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{wateringCount} arrosage{wateringCount > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Ionicons name="water-outline" size={14} color={COLORS.blue} />
          <Text style={styles.metricValue}>{avgHumidity}%</Text>
          {renderTrend()}
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="flask-outline" size={14} color={COLORS.purple} />
          <Text style={styles.metricValue}>{avgPh}</Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="thermometer-outline" size={14} color={COLORS.orange} />
          <Text style={styles.metricValue}>{avgTemperature}°C</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  trendIcon: {
    marginLeft: 2,
  }
});
