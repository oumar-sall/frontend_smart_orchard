import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface ControllerCardProps {
  name: string;
  onPress: () => void;
}

export const ControllerCard = ({ name, onPress }: ControllerCardProps) => {
  return (
    <TouchableOpacity
      style={styles.controllerCard}
      onPress={onPress}
    >
      <View style={styles.controllerInfo}>
        <View style={styles.controllerIconBox}>
          <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
        </View>
        <View>
          <Text style={styles.controllerName}>{name}</Text>
          <Text style={styles.controllerSub}>Boîtier de contrôle</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  controllerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  controllerInfo: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1, marginRight: 8 },
  controllerIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6F1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  controllerName: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  controllerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
});
