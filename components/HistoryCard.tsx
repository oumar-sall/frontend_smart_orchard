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
    if (humidityTrend === 'up') return <Ionicons name="trending-up-outline" size={14} color="#4CAF50" style={styles.trendIcon} />;
    if (humidityTrend === 'down') return <Ionicons name="trending-down-outline" size={14} color="#F44336" style={styles.trendIcon} />;
    return <Ionicons name="remove-outline" size={14} color={COLORS.textSecondary} style={styles.trendIcon} />;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <View style={styles.calendarIcon}>
            <Ionicons name="calendar" size={12} color={COLORS.green} />
          </View>
          <Text style={styles.dateText}>{displayDate}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="water" size={10} color={COLORS.green} style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>{wateringCount} arrosage{wateringCount > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={[styles.metricIcon, { backgroundColor: COLORS.blue + '10' }]}>
            <Ionicons name="water" size={14} color={COLORS.blue} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Humidité</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.metricValue}>{avgHumidity}%</Text>
              {renderTrend()}
            </View>
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.metricIcon, { backgroundColor: COLORS.purple + '10' }]}>
            <Ionicons name="flask" size={14} color={COLORS.purple} />
          </View>
          <View>
            <Text style={styles.metricLabel}>pH</Text>
            <Text style={styles.metricValue}>{avgPh}</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.metricIcon, { backgroundColor: COLORS.orange + '10' }]}>
            <Ionicons name="thermometer" size={14} color={COLORS.orange} />
          </View>
          <View>
            <Text style={styles.metricLabel}>Temp.</Text>
            <Text style={styles.metricValue}>{avgTemperature}°</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
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
    gap: 10,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.green,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAE4',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  trendIcon: {
    marginLeft: 4,
  }
});
