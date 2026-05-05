import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import MetricCard from "../../components/MetricCard";
import IrrigationCard from "../../components/IrrigationCard";
import { useDashboard } from "../../hooks/useDashboard";

const COLORS = {
  background: "#F5F0EB",
  green: "#4A7C59",
  textSecondary: "#717171",
};

export default function DashboardScreen() {
  const { 
    data, 
    externalTemp, 
    loading, 
    irrigationLoadingId, 
    handleToggleIrrigation 
  } = useDashboard();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader externalTemp={externalTemp} />

        <View style={styles.dashboardTitleContainer}>
          <Text style={styles.sectionTitle}>État du sol</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.metricsGrid}>
            {data.sensors && data.sensors.map((sensor: any) => (
              <MetricCard key={sensor.id} sensor={sensor} />
            ))}
            {(!data.sensors || data.sensors.length === 0) && (
              <Text style={styles.emptyText}>Aucune donnée de capteur trouvée.</Text>
            )}
          </View>
        )}

        <View style={styles.irrigationContainer}>
          <Text style={styles.sectionTitle}>Contrôle des équipements</Text>
          {data.actuators && data.actuators.map((act: any) => (
            <IrrigationCard
              key={act.id}
              actuator={act}
              onToggle={handleToggleIrrigation}
              loading={irrigationLoadingId === act.id}
            />
          ))}
          {(!data.actuators || data.actuators.length === 0) && !loading && (
            <Text style={styles.emptyText}>Aucun équipement configuré.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },
  dashboardTitleContainer: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  irrigationContainer: { marginTop: 32 },
  emptyText: { marginTop: 20, color: COLORS.textSecondary, fontStyle: 'italic' }
});
