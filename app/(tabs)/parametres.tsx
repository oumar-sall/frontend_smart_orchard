import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  border: "#E8E0D8",
};

const API_URL = 'http://192.168.1.8:3000';

// --- COMPOSANT SLIDER OPTIMISÉ ---
const SettingSlider = React.memo(({
  label,
  icon,
  iconColor,
  value,
  unit,
  min,
  max,
  step,
  onValueChange,
  formatValue,
  disabled,
}: any) => {
  const [localVal, setLocalVal] = React.useState(value);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Synchronisation quand les données arrivent du backend ou changement d'actionneur
  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleTouch = React.useCallback((e: any) => {
    if (trackWidth <= 0 || disabled) return;
    const x = e.nativeEvent.locationX;
    let percent = Math.max(0, Math.min(1, x / trackWidth));
    let val = min + percent * (max - min);
    val = Math.round(val / step) * step;
    val = Math.max(min, Math.min(max, val));
    setLocalVal(val);
    onValueChange(val);
  }, [trackWidth, min, max, step, onValueChange, disabled]);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (e) => { setIsDragging(true); handleTouch(e); },
    onPanResponderMove: (e) => { handleTouch(e); },
    onPanResponderRelease: () => setIsDragging(false),
    onPanResponderTerminate: () => setIsDragging(false),
  }), [handleTouch, disabled]);

  const displayVal = formatValue ? formatValue(localVal) : localVal;
  const progress = (localVal - min) / (max - min);
  const trackColor = disabled ? '#D0D0D0' : iconColor;

  return (
    <View style={[styles.settingCard, disabled && styles.settingCardDisabled]}>
      <View style={styles.settingHeader}>
        <View style={[styles.iconBox, disabled && { backgroundColor: '#F0F0F0' }]}>
          <Ionicons name={icon as any} size={20} color={disabled ? '#C0C0C0' : iconColor} />
        </View>
        <Text style={[styles.settingLabel, disabled && { color: COLORS.textSecondary }]}>{label}</Text>
        <Text style={[styles.settingValue, disabled && { color: COLORS.textSecondary }]}>
          {displayVal} <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <View
          style={[styles.sliderTrack, disabled && { backgroundColor: '#EBEBEB' }]}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View pointerEvents="none" style={[styles.sliderFill, { width: `${progress * 100}%`, backgroundColor: trackColor }]} />
          <View pointerEvents="none" style={[styles.sliderThumb, { left: `${progress * 100}%`, borderColor: trackColor, transform: [{ scale: isDragging ? 1.3 : 1 }] }]} />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLimit}>{min}{unit}</Text>
          <Text style={styles.sliderLimit}>{max}{unit}</Text>
        </View>
      </View>
    </View>
  );
});
SettingSlider.displayName = "SettingSlider";

// --- ÉCRAN PRINCIPAL ---
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
  const [isOnline, setIsOnline] = React.useState<boolean>(false);
  const [simulateStatus, setSimulateStatus] = React.useState<string | null>(null);

  // Helper pour mettre à jour un champ localement ET envoyer au backend
  const updateSetting = React.useCallback((key: string, val: any, pin: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    sendToBackend(key, val, pin);
  }, []);

  // Debounce pour les sliders (évite de spammer le backend)
  const updateSettingDebounced = React.useRef(
    (() => {
      let timeout: any;
      return (key: string, val: any, pin: string) => {
        setSettings(prev => ({ ...prev, [key]: val }));
        clearTimeout(timeout);
        timeout = setTimeout(() => sendToBackend(key, val, pin), 800);
      };
    })()
  ).current;

  const sendToBackend = async (key: string, val: any, pin: string) => {
    try {
      await axios.put(`${API_URL}/readings/settings`, { [key]: val, pin });
    } catch (error) {
      console.error("Erreur sync settings:", error);
    }
  };

  const fetchSettings = React.useCallback(async (pin: string) => {
    try {
      const response = await axios.get(`${API_URL}/readings/settings`, { params: { pin } });
      if (response.data) {
        setSettings({
          // Utilisation de ?? pour ne pas écraser les valeurs 0 légitimes
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
  }, []);

  const fetchAvailableSensors = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/readings/sensors`);
      setAvailableSensors(response.data || []);
    } catch (error) {
      console.error("Erreur fetch sensors: ", error);
    }
  }, []);

  const fetchControllerStatus = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/readings/status`);
      setIsOnline(res.data.online ?? false);
    } catch {
      setIsOnline(false);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get(`${API_URL}/readings/actuators`);
        setActuators(res.data);
        if (res.data.length > 0) {
          setSelectedPin(res.data[0].pin_number);
          fetchSettings(res.data[0].pin_number);
        }
        fetchAvailableSensors();
        fetchControllerStatus();
      } catch (error) {
        console.error("Erreur fetch actuators:", error);
      }
    };
    init();

    // Refresh statut boîtier toutes les 15s
    const interval = setInterval(fetchControllerStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchSettings, fetchAvailableSensors, fetchControllerStatus]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader />

        <Text style={styles.pageTitle}>PARAMÈTRES</Text>

        {/* --- CARTE BOÎTIER --- */}
        <View style={styles.controllerCard}>
          <View style={styles.controllerInfo}>
            <View style={styles.controllerIconBox}>
              <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
            </View>
            <View>
              <Text style={styles.controllerName}>Galileosky Verger</Text>
              <Text style={styles.controllerSub}>Boîtier IoT • RS485 / Modbus</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>

        {/* --- SÉLECTEUR D'ACTIONNEUR --- */}
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
                  key={act.id}
                  onPress={() => {
                    setSelectedPin(act.pin_number);
                    fetchSettings(act.pin_number);
                  }}
                  style={[styles.actuatorChip, isActive && styles.actuatorChipActive]}
                >
                  <Ionicons
                    name={isValve ? "water" : "flash"}
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

          {/* --- TOGGLE AUTO MODE --- */}
          <View style={styles.autoModeCard}>
            <View style={styles.autoModeInfo}>
              <View style={[styles.iconBox, { backgroundColor: settings.auto_mode ? '#EFF6F1' : '#F7F8F9' }]}>
                <Ionicons
                  name="leaf-outline"
                  size={20}
                  color={settings.auto_mode ? COLORS.green : '#C0C0C0'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Arrosage automatique</Text>
                <Text style={styles.autoModeDesc}>
                  {settings.auto_mode
                    ? 'Déclenché quand l\'humidité passe sous le seuil'
                    : 'Mode manuel uniquement'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.auto_mode}
              onValueChange={(val) => updateSetting('auto_mode', val, selectedPin)}
              trackColor={{ false: '#E0E0E0', true: '#B2D8C0' }}
              thumbColor={settings.auto_mode ? COLORS.green : '#F4F4F4'}
            />
          </View>

          <SettingSlider
            label="Durée d'irrigation"
            icon="time-outline"
            iconColor="#4A90E2"
            value={settings.irrigation_duration / 60}
            unit="min"
            min={5}
            max={60}
            step={1}
            disabled={!settings.auto_mode}
            onValueChange={(val: number) => updateSettingDebounced('irrigation_duration', val * 60, selectedPin)}
            formatValue={(val: number) => Math.round(val)}
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
            onValueChange={(val: number) => updateSettingDebounced('threshold_min', val, selectedPin)}
            formatValue={(val: number) => Math.round(val)}
          />
        </View>

        {/* --- CAPTEUR DE RÉFÉRENCE --- */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={20} color={COLORS.green} />
            <Text style={styles.sectionTitle}>Capteur de référence</Text>
          </View>
          <Text style={styles.sectionSub}>Capteur qui pilotera cet équipement</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sensorList}>
            {availableSensors.map((s) => {
              const isSelected = settings.sensor_id === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sensorChip, isSelected && styles.sensorChipSelected]}
                  onPress={() => updateSetting('sensor_id', s.id, selectedPin)}
                  disabled={!settings.auto_mode}
                >
                  <Text style={[styles.sensorChipText, isSelected && styles.sensorChipTextSelected]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {availableSensors.length === 0 && (
              <Text style={{ fontStyle: 'italic', color: COLORS.textSecondary }}>Aucun capteur trouvé.</Text>
            )}
          </ScrollView>
        </View>

        {/* --- PARAMÈTRES AVANCÉS --- */}
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
            onValueChange={(val: number) => updateSettingDebounced('reporting_interval', val, selectedPin)}
          />

          {/* 🧪 BOUTON SIMULATION TEMPORAIRE */}
          <TouchableOpacity
            style={styles.simButton}
            onPress={async () => {
              try {
                setSimulateStatus('⏳ Simulation en cours...');
                // On utilise le capteur sélectionné pour CETTE vanne, sinon fallback sur modbus1
                const targetSensorPin = availableSensors.find(s => s.id === settings.sensor_id)?.pin_number || 'modbus1';
                const res = await axios.post(`${API_URL}/readings/simulate`, { humidity: 10, pin: targetSensorPin });
                setSimulateStatus(`✅ ${res.data.message}`);
              } catch (e: any) {
                setSimulateStatus(`❌ ${e.response?.data?.error || e.message}`);
              }
              setTimeout(() => setSimulateStatus(null), 4000);
            }}
          >
            <Ionicons name="flask-outline" size={16} color="#6B7280" />
            <Text style={styles.simButtonText}>Simuler humidité basse (10%)</Text>
          </TouchableOpacity>
          {simulateStatus && <Text style={styles.simStatus}>{simulateStatus}</Text>}
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
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // --- BOÎTIER ---
  controllerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  controllerInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 8 },
  controllerIconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#EFF6F1",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  controllerName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  controllerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
  },
  statusOnline: { backgroundColor: '#EFF6F1' },
  statusOffline: { backgroundColor: '#F5F5F5' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  dotOnline: { backgroundColor: '#22C55E' },
  dotOffline: { backgroundColor: '#D1D5DB' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextOnline: { color: '#16A34A' },
  statusTextOffline: { color: '#9CA3AF' },

  // --- SECTIONS ---
  settingsSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
  },
  actuatorChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  actuatorChipText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  actuatorChipTextActive: { color: '#FFF' },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#FFF', marginLeft: 4,
  },

  // --- AUTO MODE ---
  autoModeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  autoModeInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  autoModeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // --- SLIDER ---
  settingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingCardDisabled: { opacity: 0.5 },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#F7F8F9',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  settingValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  unit: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },

  sliderContainer: {},
  sliderTrack: {
    height: 24, backgroundColor: '#F0F0F0',
    borderRadius: 12, position: 'relative', justifyContent: 'center',
  },
  sliderFill: { height: '100%', borderRadius: 12 },
  sliderThumb: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF', borderWidth: 3,
    position: 'absolute', marginLeft: -19,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLimit: { fontSize: 11, fontWeight: '600', color: '#B0B0B0' },

  // --- CAPTEUR ---
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 16 },
  sensorList: { marginHorizontal: -4 },
  sensorChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F5F5F5',
    marginHorizontal: 4, borderWidth: 1, borderColor: '#EBEBEB',
  },
  sensorChipSelected: { backgroundColor: '#EFF6F1', borderColor: COLORS.green },
  sensorChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  sensorChipTextSelected: { color: COLORS.green },

  // --- AVANCÉ ---
  experimentalSection: {
    backgroundColor: '#F9FAFB', borderRadius: 24, padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: '#F0F0F0', borderStyle: 'dashed',
  },
  experimentalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  experimentalDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 20, fontStyle: 'italic' },
  betaBadge: {
    backgroundColor: '#E5E7EB', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, marginBottom: 16,
  },
  betaText: { fontSize: 9, fontWeight: '900', color: '#6B7280' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    gap: 16, padding: 8, opacity: 0.6,
  },
  infoIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  infoSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  // --- SIMULATION (TEMP) ---
  simButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', marginTop: 16,
    justifyContent: 'center'
  },
  simButtonText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  simStatus: {
    marginTop: 8, fontSize: 12, fontWeight: '600',
    color: COLORS.green, textAlign: 'center'
  }
});
