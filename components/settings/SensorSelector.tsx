import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface Sensor {
  id: string;
  label: string;
}

interface SensorSelectorProps {
  sensors: Sensor[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  borderless?: boolean;
}

export const SensorSelector: React.FC<SensorSelectorProps> = ({
  sensors,
  selectedId,
  onSelect,
  disabled,
  borderless = false
}) => {
  return (
    <View style={[
      styles.sectionCard,
      borderless && styles.borderlessCard
    ]}>
      <View style={styles.sectionHeader}>
        {!borderless && <Ionicons name="link-outline" size={20} color={COLORS.green} />}
        <Text style={styles.sectionTitle}>Capteur de référence</Text>
      </View>
      <Text style={styles.sectionSub}>Capteur qui pilotera cet équipement</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sensorList}>
        {sensors.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.sensorChip, isSelected && styles.sensorChipSelected]}
              onPress={() => onSelect(s.id)}
              disabled={disabled}
            >
              <Text style={[styles.sensorChipText, isSelected && styles.sensorChipTextSelected]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {sensors.length === 0 && (
          <Text style={styles.emptyText}>Aucun capteur trouvé.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  borderlessCard: {
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, fontWeight: '600' },
  sensorList: { marginHorizontal: -4 },
  sensorChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#F7F8F9',
    marginHorizontal: 4, borderWidth: 1, borderColor: '#F0EAE4',
  },
  sensorChipSelected: { backgroundColor: '#EFF6F1', borderColor: COLORS.green },
  sensorChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  sensorChipTextSelected: { color: COLORS.green },
  emptyText: { fontStyle: 'italic', color: COLORS.textSecondary },
});
