import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingSlider } from '@/components/settings/SettingSlider';
import { ActuatorSelector } from '@/components/settings/ActuatorSelector';
import { ControllerCard } from '@/components/settings/ControllerCard';
import { AutoModeCard } from '@/components/settings/AutoModeCard';
import { SensorSelector } from '@/components/settings/SensorSelector';
import { COLORS } from "../../constants/Theme";
import { useSettings } from "../../hooks/useSettings";

export default function ParametresScreen() {
  const router = useRouter();
  const {
    settings, actuators, selectedPin, setSelectedPin, availableSensors,
    activeController, handleLogout, fetchSettings,
    updateDuration, updateThreshold, updateReporting, updateSensor, updateAutoMode
  } = useSettings();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader />

          <ControllerCard
            name={activeController.name}
            onPress={() => activeController.id && router.push(`/controllers/${activeController.id}` as any)}
          />

          {actuators.length > 0 && (
            <>
              <View style={{ marginBottom: 12 }}>
                <ActuatorSelector
                  actuators={actuators}
                  selectedPin={selectedPin}
                  onSelect={(pin) => { setSelectedPin(pin); fetchSettings(pin); }}
                />
              </View>

              <SettingsGroup title="Configuration de l'Arrosage">
                <SettingSlider
                  label="Durée d'irrigation par session"
                  icon="time-outline" iconColor="#4A90E2"
                  value={settings.irrigation_duration / 60}
                  unit="min" min={5} max={60} step={1} borderless
                  onValueChange={updateDuration}
                  formatValue={(val) => Math.round(val)}
                />
              </SettingsGroup>

              <SettingsGroup title="Automatisation Avancée">
                <AutoModeCard isEnabled={settings.auto_mode} borderless onToggle={updateAutoMode} />
                {settings.auto_mode && (
                  <>
                    <SettingSlider
                      label="Seuil de déclenchement d'humidité"
                      icon="water-outline" iconColor="#10B981"
                      value={settings.threshold_min}
                      unit="%" min={0} max={100} step={1} borderless
                      onValueChange={updateThreshold}
                      formatValue={(val) => Math.round(val)}
                    />
                    <SensorSelector
                      sensors={availableSensors}
                      selectedId={settings.sensor_id}
                      borderless onSelect={updateSensor}
                    />
                  </>
                )}
              </SettingsGroup>
            </>
          )}

          <SettingsGroup title="Paramètres Techniques">
            <View style={styles.experimentalHeader}>
              <Ionicons name="flash-outline" size={16} color="#9CA3AF" />
              <Text style={styles.experimentalDesc}>L&apos;intervalle de scan impacte la consommation batterie.</Text>
            </View>
            <SettingSlider
              label="Intervalle de scan de l&apos;antenne"
              icon="wifi-outline" iconColor="#9CA3AF"
              value={settings.reporting_interval}
              unit="sec" min={10} max={120} step={5} borderless
              onValueChange={updateReporting}
            />
          </SettingsGroup>

          <SettingsGroup title="Compte & Application">
            <TouchableOpacity style={styles.manageBtnBody} onPress={() => router.push("/controllers" as any)}>
              <View style={styles.manageBtnContent}>
                <View style={styles.manageIconBox}>
                  <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.green} />
                </View>
                <Text style={styles.manageBtnText}>Gérer mes boîtiers</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.manageBtnBody} onPress={() => router.push("/(tabs)/profil" as any)}>
              <View style={styles.manageBtnContent}>
                <View style={styles.manageIconBox}>
                  <Ionicons name="person-outline" size={20} color={COLORS.green} />
                </View>
                <Text style={styles.manageBtnText}>Mon Profil</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.manageBtnBody} onPress={handleLogout}>
              <View style={styles.manageBtnContent}>
                <View style={[styles.manageIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </View>
                <Text style={[styles.manageBtnText, { color: '#EF4444' }]}>Se déconnecter</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" opacity={0.5} />
            </TouchableOpacity>
          </SettingsGroup>

          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.green} />
            <Text style={styles.infoSub}>Smart Orchard v1.3.0 • Agrotech ML Secured Edition</Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  experimentalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 },
  experimentalDesc: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', fontWeight: '500' },
  manageBtnBody: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  manageBtnContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  manageIconBox: { width: 40, height: 40, backgroundColor: "#EFF6F1", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  manageBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, opacity: 0.6, marginTop: 10, justifyContent: 'center' },
  infoSub: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },
});
