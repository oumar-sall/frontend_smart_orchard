import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import CircularGauge from "./CircularGauge";

const { width } = Dimensions.get('window');
const GAUGE_SIZE = (width - 120) / 3;
const CARD_WIDTH = (width - 72) / 3;

const COLORS = {
  card: "#FFFFFF",
  green: "#4A7C59",
  labelColor: "#555555",
};

const getSensorColor = (value: number, unit: string, min: number, max: number) => {
  if (isNaN(value)) return COLORS.green;
  
  const minColor = { r: 74, g: 144, b: 226 };  // Blue
  const maxColor = { r: 255, g: 59, b: 48 };   // Red

  const interpolate = (ratio: number) => {
    let constrained = Math.max(0, Math.min(1, ratio));
    const r = Math.round(minColor.r + (maxColor.r - minColor.r) * constrained);
    const g = Math.round(minColor.g + (maxColor.g - minColor.g) * constrained);
    const b = Math.round(minColor.b + (maxColor.b - minColor.b) * constrained);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (unit === '°C') {
    const ratio = (max - min) === 0 ? 0 : (value - min) / (max - min);
    return interpolate(ratio);
  } else if (unit === '%') {
    const ratio = (max - min) === 0 ? 0 : (value - min) / (max - min);
    return interpolate(1 - ratio);
  } else if (unit === 'pH') {
    const ratio = Math.abs(value - 7) / 7;
    return interpolate(ratio);
  }
  return COLORS.green;
};

const getSensorLabel = (label: string, unit: string) => {
  if (label) return label;
  if (unit === '°C') return "Température";
  if (unit === '%') return "Humidité";
  if (unit === 'pH') return "pH";
  return "Capteur";
};

interface MetricCardProps {
  sensor: any;
}

export default function MetricCard({ sensor }: MetricCardProps) {
  const { title, value, unit, min = 0, max = 100 } = sensor;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isAvailable = !isNaN(numValue) && value !== '--';
  const color = getSensorColor(numValue, unit, min, max);

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
        <Text style={styles.metricTitle}>{getSensorLabel(title, unit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 12,
    paddingTop: 16,
    width: CARD_WIDTH,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  metricHeader: { flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 8 },
  metricTitle: { fontSize: 10, fontWeight: '700', color: COLORS.labelColor, textAlign: 'center', textTransform: 'uppercase' },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center' },
});
