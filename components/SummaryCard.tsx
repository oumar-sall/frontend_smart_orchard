import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/Theme";

const { width } = Dimensions.get('window');
const SUMMARY_CARD_WIDTH = (width - 56) / 3;

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

export default function SummaryCard({ title, value, unit, icon, color }: SummaryCardProps) {
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

const styles = StyleSheet.create({
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
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
