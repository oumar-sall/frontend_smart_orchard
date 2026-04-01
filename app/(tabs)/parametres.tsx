import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { storage } from "@/utils/storage";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import { API_URL } from "@/constants/Api";

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
      await axios.put(`${API_URL}/readings/settings`, {
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
              axios.put(`${API_URL}/readings/settings`, { [key]: val, pin, controller_id: id })
                .catch(err => console.error("Erreur debounce sync:", err));
            }
          });
        }, 800);
      };
    })()
  ).current;

  const fetchSettings = React.useCallback(async (pin: string) => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      const response = await axios.get(`${API_URL}/readings/settings`, {
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
      const response = await axios.get(`${API_URL}/readings/sensors`, {
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

          const res = await axios.get(`${API_URL}/readings/actuators`, {
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
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader />

        <Text style={styles.pageTitle}>PARAMÈTRES</Text>

        <ControllerCard
          name={activeController.name}
          onPress={() => activeController.id && router.push(`/controllers/${activeController.id}` as any)}
        />

        <ActuatorSelector
          actuators={actuators}
          selectedPin={selectedPin}
          onSelect={(pin) => {
            setSelectedPin(pin);
            fetchSettings(pin);
          }}
        />

        <AutoModeCard
          isEnabled={settings.auto_mode}
          onToggle={(val) => updateSetting('auto_mode', val, selectedPin)}
        />

        <SettingSlider
          label="Durée d'irrigation"
          icon="time-outline"
          iconColor="#4A90E2"
          value={settings.irrigation_duration / 60}
          unit="min"
          min={5}
          max={60}
          step={1}
          onValueChange={React.useCallback((val: number) => updateSettingDebounced('irrigation_duration', val * 60, selectedPin), [updateSettingDebounced, selectedPin])}
          formatValue={React.useCallback((val: number) => Math.round(val), [])}
        />

        <SettingSlider
          label="Seuil de déclenchement (Humidité)"
          icon="water-outline"
          iconColor="#10B981"
          value={settings.threshold_min}
          unit="%"
          min={0}
          max={100}
          step={1}
          disabled={!settings.auto_mode}
          onValueChange={React.useCallback((val: number) => updateSettingDebounced('threshold_min', val, selectedPin), [updateSettingDebounced, selectedPin])}
          formatValue={React.useCallback((val: number) => Math.round(val), [])}
        />

        <SensorSelector
          sensors={availableSensors}
          selectedId={settings.sensor_id}
          onSelect={(id) => updateSetting('sensor_id', id, selectedPin)}
          disabled={!settings.auto_mode}
        />

        <View style={styles.experimentalSection}>
          <View style={styles.experimentalHeader}>
            <Text style={styles.sectionTitle}>PARAMÈTRES AVANCÉS</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BÊTA</Text>
            </View>
          </View>
          <Text style={styles.experimentalDesc}>L&apos;intervalle de scan impacte la consommation batterie du boîtier.</Text>
          <SettingSlider
            label="Intervalle de scan"
            icon="wifi-outline"
            iconColor="#9CA3AF"
            value={settings.reporting_interval}
            unit="sec"
            min={10}
            max={120}
            step={5}
            onValueChange={React.useCallback((val: number) => updateSettingDebounced('reporting_interval', val, selectedPin), [updateSettingDebounced, selectedPin])}
          />
        </View>

        <View style={styles.systemSection}>
          <Text style={styles.sectionTitle}>SYSTÈME</Text>
          <TouchableOpacity style={styles.manageBtn} onPress={() => router.push("/controllers" as any)}>
            <View style={styles.manageBtnContent}>
              <View style={styles.manageIconBox}>
                <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.manageBtnText}>Gérer mes boîtiers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.systemSection}>
          <Text style={styles.sectionTitle}>COMPTE</Text>
          <TouchableOpacity style={[styles.manageBtn, { borderColor: '#FEE2E2' }]} onPress={handleLogout}>
            <View style={styles.manageBtnContent}>
              <View style={[styles.manageIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.manageBtnText, { color: '#EF4444' }]}>Se déconnecter</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" opacity={0.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.green} />
          </View>
          <View>
            <Text style={styles.infoTitle}>Smart Orchard v1.2.5</Text>
            <Text style={styles.infoSub}>Multi-actuateurs activé • Agrotech ML</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  experimentalSection: {
    backgroundColor: '#F9FAFB', borderRadius: 24, padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: '#F0EAE4', borderStyle: 'dashed',
  },
  experimentalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  experimentalDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 20, fontStyle: 'italic', fontWeight: '500' },
  betaBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  betaText: { fontSize: 9, fontWeight: '900', color: '#6B7280' },
  systemSection: { marginTop: 8, marginBottom: 32 },
  manageBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.card, padding: 20, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 4,
  },
  manageBtnContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  manageIconBox: {
    width: 44, height: 44, backgroundColor: "#EFF6F1", borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  manageBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 8, opacity: 0.8, marginTop: 16 },
  infoIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  infoSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
});
