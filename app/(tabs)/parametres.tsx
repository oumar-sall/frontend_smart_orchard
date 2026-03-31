import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { storage } from "@/utils/storage";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import { API_URL } from "@/constants/Api";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  border: "#E8E0D8",
};

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
      const controllerId = await storage.getItem('selectedControllerId');
      await axios.put(`${API_URL}/readings/settings`, {
        [key]: val,
        pin,
        controller_id: controllerId
      });
    } catch (error) {
      console.error("Erreur sync settings:", error);
    }
  };

  const fetchSettings = React.useCallback(async (pin: string) => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await axios.get(`${API_URL}/readings/settings`, {
        params: { pin, controller_id: controllerId }
      });
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
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await axios.get(`${API_URL}/readings/sensors`, {
        params: { controller_id: controllerId }
      });
      setAvailableSensors(response.data || []);
    } catch (error) {
      console.error("Erreur fetch sensors: ", error);
    }
  }, []);

  const fetchControllerStatus = React.useCallback(async () => {
    // On garde la fonction pour le moment au cas où on voudrait rafraichir d'autres choses, 
    // mais le badge est géré par AppHeader.
  }, []);

  const [activeController, setActiveController] = React.useState({ id: '', name: 'Galileosky Verger' });
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const refresh = async () => {
        try {
          // Charger le contrôleur actif depuis le stockage
          const storedId = await storage.getItem('selectedControllerId');
          const storedName = await storage.getItem('selectedControllerName');
          if (storedId) {
            setActiveController({ id: storedId, name: storedName || 'Contrôleur sans nom' });
          }

          // Re-fetch la liste des actionneurs au focus
          const res = await axios.get(`${API_URL}/readings/actuators`, {
            params: { controller_id: storedId }
          });
          setActuators(res.data);

          // Déterminer quelle pin charger
          let pinToLoad = selectedPin;

          // Si rien n'est sélectionné ou si la sélection n'existe plus dans la liste brute
          const exists = res.data.find((a: any) => a.pin_number === selectedPin);
          if (!exists && res.data.length > 0) {
            pinToLoad = res.data[0].pin_number;
            setSelectedPin(pinToLoad);
          }

          if (pinToLoad && pinToLoad !== 'OUT 0') {
            fetchSettings(pinToLoad);
          }

          fetchControllerStatus();
          fetchAvailableSensors();
        } catch (error) {
          console.error("Erreur refresh focus:", error);
        }
      };

      refresh();
    }, [selectedPin, fetchControllerStatus, fetchSettings, fetchAvailableSensors])
  );

  React.useEffect(() => {
    // Statut boîtier toutes les 10s quand on est sur la page
    const interval = setInterval(fetchControllerStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchControllerStatus]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader />

        <Text style={styles.pageTitle}>PARAMÈTRES</Text>

        {/* --- CARTE BOÎTIER --- */}
        <TouchableOpacity
          style={styles.controllerCard}
          onPress={() => activeController.id && router.push(`/controllers/${activeController.id}` as any)}
        >
          <View style={styles.controllerInfo}>
            <View style={styles.controllerIconBox}>
              <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
            </View>
            <View>
              <Text style={styles.controllerName}>{activeController.name}</Text>
              <Text style={styles.controllerSub}>Boîtier de contrôle</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

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
        </View>

        {/* --- SYSTÈME --- */}
        <View style={styles.systemSection}>
          <Text style={styles.sectionTitle}>SYSTÈME</Text>
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => router.push("/controllers" as any)}
          >
            <View style={styles.manageBtnContent}>
              <View style={styles.manageIconBox}>
                <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.manageBtnText}>Gérer mes boîtiers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
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

  // --- BOÎTIER ---
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
  
  // --- SECTIONS ---
  settingsSection: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0EAE4',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actuatorChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  actuatorChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  actuatorChipTextActive: { color: '#FFF' },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  autoModeInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  autoModeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },

  // --- SLIDER ---
  settingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  settingCardDisabled: { opacity: 0.6 },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#F7F8F9',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  settingValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  unit: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  sliderContainer: {},
  sliderTrack: {
    height: 24, backgroundColor: '#F0EAE4',
    borderRadius: 12, position: 'relative', justifyContent: 'center',
  },
  sliderFill: { height: '100%', borderRadius: 12 },
  sliderThumb: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF', borderWidth: 3,
    position: 'absolute', marginLeft: -18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  sliderLimit: { fontSize: 12, fontWeight: '700', color: '#B0B0B0' },

  // --- CAPTEUR ---
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, fontWeight: '600' },
  sensorList: { marginHorizontal: -4 },
  sensorChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, backgroundColor: '#F7F8F9',
    marginHorizontal: 4, borderWidth: 1, borderColor: '#F0EAE4',
  },
  sensorChipSelected: { backgroundColor: '#EFF6F1', borderColor: COLORS.green },
  sensorChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  sensorChipTextSelected: { color: COLORS.green },

  // --- AVANCÉ ---
  experimentalSection: {
    backgroundColor: '#F9FAFB', borderRadius: 24, padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: '#F0EAE4', borderStyle: 'dashed',
  },
  experimentalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  experimentalDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 20, fontStyle: 'italic', fontWeight: '500' },
  betaBadge: {
    backgroundColor: '#E5E7EB', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6,
  },
  betaText: { fontSize: 9, fontWeight: '900', color: '#6B7280' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    gap: 16, padding: 8, opacity: 0.8, marginTop: 16,
  },
  infoIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  infoSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },

  systemSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  manageBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  manageIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#EFF6F1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});
