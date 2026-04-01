import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface ActuatorSelectorProps {
  actuators: any[];
  selectedPin: string;
  onSelect: (pin: string) => void;
}

export const ActuatorSelector = ({ actuators, selectedPin, onSelect }: ActuatorSelectorProps) => {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>CHOIX DE L&apos;ÉQUIPEMENT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.actuatorScroll}
        contentContainerStyle={styles.actuatorScrollContent}
      >
        {actuators.map((act) => {
          const isActive = selectedPin === act.pin_number;
          const isValve = act.label.toLowerCase().includes('vanne');
          return (
            <TouchableOpacity
              key={act.pin_number}
              style={[styles.actuatorChip, isActive && styles.actuatorChipActive]}
              onPress={() => onSelect(act.pin_number)}
            >
              <Ionicons
                name={isValve ? "water-outline" : "speedometer-outline"}
                size={18}
                color={isActive ? "#FFF" : COLORS.green}
              />
              <Text style={[styles.actuatorChipText, isActive && styles.actuatorChipTextActive]}>
                {act.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsSection: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  actuatorScroll: { marginBottom: 20, marginHorizontal: -20 },
  actuatorScrollContent: { paddingHorizontal: 20, gap: 10 },
  actuatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0EAE4',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actuatorChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  actuatorChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  actuatorChipTextActive: { color: '#FFF' },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#FFF', marginLeft: 4,
  },
});
