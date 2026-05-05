import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  danger: "#FF3B30",
};

interface ComponentCardProps {
  item: any;
  type: "capteurs" | "actionneurs";
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export default function ComponentCard({ item, type, onEdit, onDelete }: ComponentCardProps) {
  // Détection de l'icône intelligente
  const getIcon = () => {
    if (type === "capteurs") {
      const label = item.label?.toLowerCase() || "";
      if (label.includes('temp')) return "thermometer-outline";
      if (label.includes('hum')) return "water-outline";
      if (label.includes('ph')) return "flask-outline";
      return "hardware-chip-outline";
    } else {
      const isValve = item.label?.toLowerCase().includes('vanne');
      return isValve ? "water" : "flash";
    }
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemIconBox}>
        <Ionicons name={getIcon() as any} size={24} color={COLORS.green} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.label || "Composant inconnu"}</Text>
        <Text style={styles.itemSub}>
          Pin: {item.pin_number || "N/A"}
          {item.modbus_tag ? ` | Tag: ${item.modbus_tag}` : ""}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(item)}>
          <Ionicons name="pencil-outline" size={20} color={COLORS.green} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
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
  itemIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6F1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  editButton: {
    padding: 10,
    backgroundColor: "#EFF6F1",
    borderRadius: 12,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#FFEBEB",
    borderRadius: 12,
  },
});
