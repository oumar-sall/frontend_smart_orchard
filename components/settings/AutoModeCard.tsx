import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface AutoModeCardProps {
  isEnabled: boolean;
  onToggle: (val: boolean) => void;
}

export const AutoModeCard = ({ isEnabled, onToggle }: AutoModeCardProps) => {
  return (
    <View style={styles.autoModeCard}>
      <View style={styles.autoModeInfo}>
        <View style={[styles.iconBox, { backgroundColor: isEnabled ? '#EFF6F1' : '#F7F8F9' }]}>
          <Ionicons
            name="leaf-outline"
            size={20}
            color={isEnabled ? COLORS.green : '#C0C0C0'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.autoModeTitle}>Mode Automatique</Text>
          <Text style={styles.autoModeSub}>Gestion intelligente via capteur</Text>
        </View>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: "#D1D1D1", true: "#A8C6B1" }}
        thumbColor={isEnabled ? COLORS.green : "#F4F3F4"}
        ios_backgroundColor="#D1D1D1"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  autoModeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  autoModeInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoModeTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  autoModeSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
});
