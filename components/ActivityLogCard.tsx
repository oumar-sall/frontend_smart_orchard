import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityLogCardProps {
  type: string;
  description: string;
  timestamp: string;
}

const COLORS = {
  IRRIGATION: '#4A90E2',
  SETTINGS_UPDATE: '#F2994A',
  DEFAULT: '#717171',
  background: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#717171',
  border: '#F0EAE4',
};

const getIcon = (type: string) => {
  switch (type) {
    case 'IRRIGATION': return 'water';
    case 'SETTINGS_UPDATE': return 'settings';
    default: return 'notifications';
  }
};

const getColor = (type: string) => {
  return COLORS[type as keyof typeof COLORS] || COLORS.DEFAULT;
};

export default function ActivityLogCard({ type, description, timestamp }: ActivityLogCardProps) {
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: getColor(type) + '15' }]}>
        <Ionicons name={getIcon(type) as any} size={20} color={getColor(type)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.time}>{formattedDate} • {formattedTime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
