import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";

import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingSlider } from '@/components/settings/SettingSlider';
import { ActuatorSelector } from '@/components/settings/ActuatorSelector';
import { ControllerCard } from '@/components/settings/ControllerCard';
import { AutoModeCard } from '@/components/settings/AutoModeCard';
import { SensorSelector } from '@/components/settings/SensorSelector';
import { COLORS } from '@/components/settings/constants';

export default function ParametresScreen() {
  const [actuators, setActuators] = React.useState<any[]>([]);
  const [selectedPin, setSelectedPin] = React.useState('OUT 0');
  const [settings, setSettings] = React.useState({
    irrigation_duration: 900,
    reporting_interval: 30,
    threshold_min: 35.0,
    sensor_id: null as string | null,
    auto_mode: false,
  });
  const [availableSensors, setAvailableSensors] = React.useState<any[]>([]);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const sendToBackend = React.useCallback(async (key: string, val: any, pin: string) => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      await api.put(`/readings/settings`, {
        [key]: val,
        pin,
        controller_id: controllerId
      });
    } catch (error) {
      console.error("Erreur sync settings:", error);
    }
  }, [isLoggingOut]);

  const updateSetting = React.useCallback((key: string, val: any, pin: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    sendToBackend(key, val, pin);
  }, [sendToBackend]);

  const updateSettingDebounced = React.useRef(
    (() => {
      let timeout: any;
      return (key: string, val: any, pin: string) => {
        setSettings(prev => ({ ...prev, [key]: val }));
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          storage.getItem('selectedControllerId').then(id => {
            if (id) {
              api.put(`/readings/settings`, { [key]: val, pin, controller_id: id })
                .catch(err => console.error("Erreur debounce sync:", err));
            }
          });
        }, 800);
      };
    })()
  ).current;

  // -- Hooks for Props (Rules of Hooks: must be at top level) --
  const handleDurationChange = React.useCallback((val: number) => {
    updateSettingDebounced('irrigation_duration', val * 60, selectedPin);
  }, [updateSettingDebounced, selectedPin]);

  const handleThresholdChange = React.useCallback((val: number) => {
    updateSettingDebounced('threshold_min', val, selectedPin);
  }, [updateSettingDebounced, selectedPin]);

  const handleReportingChange = React.useCallback((val: number) => {
    updateSettingDebounced('reporting_interval', val, selectedPin);
  }, [updateSettingDebounced, selectedPin]);

  const handleSensorSelect = React.useCallback((id: string) => {
    updateSetting('sensor_id', id, selectedPin);
  }, [updateSetting, selectedPin]);

  const handleAutoToggle = React.useCallback((val: boolean) => {
    updateSetting('auto_mode', val, selectedPin);
  }, [updateSetting, selectedPin]);

  const formatRoundValue = React.useCallback((val: number) => Math.round(val), []);

  const fetchSettings = React.useCallback(async (pin: string) => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      const response = await api.get(`/readings/settings`, {
        params: { pin, controller_id: controllerId }
      });
      if (response.data) {
        setSettings({
          irrigation_duration: response.data.irrigation_duration ?? 900,
          reporting_interval: response.data.reporting_interval ?? 30,
          threshold_min: response.data.threshold_min ?? 35.0,
          sensor_id: response.data.sensor_id ?? null,
          auto_mode: response.data.auto_mode ?? false,
        });
      }
    } catch (error) {
      console.error("Erreur fetch settings: ", error);
    }
  }, [isLoggingOut]);

  const fetchAvailableSensors = React.useCallback(async () => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      const response = await api.get(`/readings/sensors`, {
        params: { controller_id: controllerId }
      });
      setAvailableSensors(response.data || []);
    } catch (error) {
      console.error("Erreur fetch sensors: ", error);
    }
  }, [isLoggingOut]);

  const [activeController, setActiveController] = React.useState({ id: '', name: 'Galileosky Verger' });
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await storage.deleteItem('userToken');
      await storage.deleteItem('userData');
      await storage.deleteItem('selectedControllerId');
      await storage.deleteItem('selectedControllerName');
      router.replace('/login');
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const refresh = async () => {
        try {
          const storedId = await storage.getItem('selectedControllerId');
          const storedName = await storage.getItem('selectedControllerName');
          if (storedId) {
            setActiveController({ id: storedId, name: storedName || 'Contrôleur sans nom' });
          }
          if (!storedId || isLoggingOut) return;

          const res = await api.get(`/readings/actuators`, {
            params: { controller_id: storedId }
          });
          setActuators(res.data);

          let pinToLoad = selectedPin;
          const exists = res.data.find((a: any) => a.pin_number === selectedPin);
          if (!exists && res.data.length > 0) {
            pinToLoad = res.data[0].pin_number;
            setSelectedPin(pinToLoad);
          }
          if (pinToLoad && pinToLoad !== 'OUT 0') {
            fetchSettings(pinToLoad);
          }
          fetchAvailableSensors();
        } catch (error) {
          console.error("Erreur refresh focus:", error);
        }
      };
      refresh();
    }, [selectedPin, fetchSettings, fetchAvailableSensors, isLoggingOut])
  );

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
                  onSelect={(pin) => {
                    setSelectedPin(pin);
                    fetchSettings(pin);
                  }}
                />
              </View>

              <SettingsGroup title="Configuration de l'Arrosage">
                <SettingSlider
                  label="Durée d'irrigation par session"
                  icon="time-outline"
                  iconColor="#4A90E2"
                  value={settings.irrigation_duration / 60}
                  unit="min"
                  min={5}
                  max={60}
                  step={1}
                  borderless
                  onValueChange={handleDurationChange}
                  formatValue={formatRoundValue}
                />
              </SettingsGroup>

              <SettingsGroup title="Automatisation Avancée">
                <AutoModeCard
                  isEnabled={settings.auto_mode}
                  borderless
                  onToggle={handleAutoToggle}
                />
                {settings.auto_mode ? (
                  <SettingSlider
                    label="Seuil de déclenchement d'humidité"
                    icon="water-outline"
                    iconColor="#10B981"
                    value={settings.threshold_min}
                    unit="%"
                    min={0}
                    max={100}
                    step={1}
                    borderless
                    onValueChange={handleThresholdChange}
                    formatValue={formatRoundValue}
                  />
                ) : null}
                {settings.auto_mode ? (
                  <SensorSelector
                    sensors={availableSensors}
                    selectedId={settings.sensor_id}
                    borderless
                    onSelect={handleSensorSelect}
                  />
                ) : null}
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
              icon="wifi-outline"
              iconColor="#9CA3AF"
              value={settings.reporting_interval}
              unit="sec"
              min={10}
              max={120}
              step={5}
              borderless
              onValueChange={handleReportingChange}
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
  manageBtnBody: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12,
  },
  manageBtnContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  manageIconBox: {
    width: 40, height: 40, backgroundColor: "#EFF6F1", borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  manageBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, opacity: 0.6, marginTop: 10, justifyContent: 'center' },
  infoSub: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700' },
});
