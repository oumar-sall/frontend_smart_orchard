import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/utils/api';

const COLORS = {
  background: '#F5F0EB',
  card: '#FFFFFF',
  green: '#4A7C59',
  textPrimary: '#1A1A1A',
  textSecondary: '#717171',
  border: '#F0EAE4',
  IRRIGATION: '#4A90E2',
  IRRIGATION_AUTO: '#10B981',
  SETTINGS_UPDATE: '#F2994A',
  DEFAULT: '#717171',
};

const getIcon = (type: string) => {
  switch (type) {
    case 'IRRIGATION': 
    case 'IRRIGATION_AUTO': return 'water';
    case 'SETTINGS_UPDATE': return 'settings';
    default: return 'notifications';
  }
};

const getColor = (type: string) => {
  return COLORS[type as keyof typeof COLORS] || COLORS.DEFAULT;
};

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/activity-logs/${id}`);
        setLog(response.data);
      } catch (error) {
        console.error("Erreur fetch log detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  if (!log) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Activité introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const date = new Date(log.timestamp);
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{"Détails de l'activité"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <View style={[styles.iconLarge, { backgroundColor: getColor(log.event_type) + '15' }]}>
            <Ionicons name={getIcon(log.event_type) as any} size={40} color={getColor(log.event_type)} />
          </View>
          <Text style={styles.eventType}>{log.event_type.replace('_', ' ')}</Text>
          <Text style={styles.description}>{log.description}</Text>
          
          <View style={styles.userBadge}>
            <Ionicons name="person-circle-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.userNameText}>
                {log.User ? `${log.User.first_name} ${log.User.last_name}` : 'Système Automatique'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Détails temporels & matériel</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.green} />
            </View>
            <View>
                <Text style={styles.infoLabel}>Date et Heure</Text>
                <Text style={styles.infoValue}>{formattedDate} à {formattedTime}</Text>
            </View>
          </View>

          {log.User && (
            <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: '#EBF5FF' }]}>
                    <Ionicons name="call-outline" size={20} color="#4A90E2" />
                </View>
                <View>
                    <Text style={styles.infoLabel}>{"Coordonnées de l'auteur"}</Text>
                    <Text style={styles.infoValue}>{log.User.phone}</Text>
                </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="hardware-chip-outline" size={20} color="#F2994A" />
            </View>
            <View>
                <Text style={styles.infoLabel}>Boîtier concerné</Text>
                <Text style={styles.infoValue}>{log.Controller?.name || 'Inconnu'}</Text>
                {log.Controller?.imei && <Text style={styles.infoSubValue}>IMEI: {log.Controller.imei}</Text>}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  description: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoSection: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoSubValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  backBtn: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
