import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
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

const API_URL = 'http://192.168.1.15:3000';

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
  formatValue 
}: any) => {
  const [localVal, setLocalVal] = React.useState(value);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  // Synchronisation initiale (quand les données arrivent du backend ou changement d'actionneur)
  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleTouch = React.useCallback((e: any) => {
    if (trackWidth <= 0) return;
    const x = e.nativeEvent.locationX;
    let percent = Math.max(0, Math.min(1, x / trackWidth));
    let val = min + percent * (max - min);
    val = Math.round(val / step) * step;
    val = Math.max(min, Math.min(max, val));
    
    setLocalVal(val);
    onValueChange(val); 
  }, [trackWidth, min, max, step, onValueChange]);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      setIsDragging(true);
      handleTouch(e);
    },
    onPanResponderMove: (e) => {
      handleTouch(e);
    },
    onPanResponderRelease: () => setIsDragging(false),
    onPanResponderTerminate: () => setIsDragging(false),
  }), [handleTouch]);

  const displayVal = formatValue ? formatValue(localVal) : localVal;
  const progress = (localVal - min) / (max - min);

  return (
    <View style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{displayVal} <Text style={styles.unit}>{unit}</Text></Text>
      </View>

      <View style={styles.sliderContainer}>
        <View 
          style={styles.sliderTrack}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View pointerEvents="none" style={[styles.sliderFill, { width: `${progress * 100}%`, backgroundColor: iconColor }]} />
          <View pointerEvents="none" style={[styles.sliderThumb, { left: `${progress * 100}%`, borderColor: iconColor, transform: [{ scale: isDragging ? 1.3 : 1 }] }]} />
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

export default function ParametresScreen() {
  const [actuators, setActuators] = React.useState<any[]>([]);
  const [selectedPin, setSelectedPin] = React.useState('OUT 0');
  const [settings, setSettings] = React.useState({
    irrigation_duration: 900,
    reporting_interval: 30,
  });

  const fetchSettings = React.useCallback(async (pin: string) => {
    try {
      const response = await axios.get(`${API_URL}/readings/settings`, { params: { pin } });
      if (response.data) setSettings(response.data);
    } catch (error) {
      console.error("Erreur fetch settings:", error);
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
      } catch (error) {
        console.error("Erreur fetch actuators:", error);
      }
    };
    init();
  }, [fetchSettings]);

  const updateSettingDebounced = React.useRef(
    (() => {
      let timeout: any;
      return (val: number, key: string, pin: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          try {
            await axios.put(`${API_URL}/readings/settings`, { [key]: val, pin });
          } catch (error) {
            console.error("Erreur sync settings:", error);
          }
        }, 800);
      };
    })()
  ).current;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader />
        
        <Text style={styles.sectionTitle}>PARAMÈTRES</Text>
        
        <Link href="/profil" asChild>
          <TouchableOpacity style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person-outline" size={24} color={COLORS.green} />
              </View>
              <View>
                <Text style={styles.profileName}>Amadou Diallo</Text>
                <Text style={styles.profileRole}>Technicien agricole</Text>
                <Text style={styles.profileLoc}>📍 Verger Nord - Bamako</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Link>

        {/* --- SÉLECTEUR D'ACTIONNEUR --- */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>CHOIX DE L&apos;ÉQUIPEMENT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actuatorScroll} contentContainerStyle={styles.actuatorScrollContent}>
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

          <SettingSlider
            label="Durée d'irrigation"
            icon="time-outline"
            iconColor="#4A90E2"
            value={settings.irrigation_duration / 60}
            unit="min"
            min={5}
            max={60}
            step={1}
            onValueChange={(val: number) => updateSettingDebounced(val * 60, 'irrigation_duration', selectedPin)}
            formatValue={(val: number) => Math.round(val)}
          />
        </View>

        {/* --- SECTION EXPÉRIMENTALE --- */}
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
            onValueChange={(val: number) => updateSettingDebounced(val, 'reporting_interval', selectedPin)}
          />
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
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase'
  },

  profileCard: {
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
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileAvatar: {
    width: 50,
    height: 50,
    backgroundColor: "#EFF6F1",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  profileRole: { fontSize: 13, color: COLORS.textSecondary, marginTop: 1 },
  profileLoc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },

  settingsSection: { marginBottom: 24 },
  
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
    position: 'relative'
  },
  actuatorChipActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  actuatorChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actuatorChipTextActive: {
    color: '#FFF',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    marginLeft: 4,
  },

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
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  settingValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  unit: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  
  sliderContainer: { },
  sliderTrack: {
    height: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: { height: '100%', borderRadius: 12 },
  sliderThumb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    borderWidth: 3,
    position: 'absolute',
    marginLeft: -19,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLimit: { fontSize: 11, fontWeight: '600', color: '#B0B0B0' },

  experimentalSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed'
  },
  experimentalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  experimentalDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 20, fontStyle: 'italic' },
  betaBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 16
  },
  betaText: { fontSize: 9, fontWeight: '900', color: '#6B7280' },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
    opacity: 0.6
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  infoSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }
});
