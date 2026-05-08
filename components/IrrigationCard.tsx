import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/Theme";

interface IrrigationCardProps {
  actuator: any;
  onToggle: (id: string, currentAction: string) => void;
  loading: boolean;
}

export default function IrrigationCard({ actuator, onToggle, loading }: IrrigationCardProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const isIrrigating = actuator.active;

  useEffect(() => {
    let interval: any;
    if (actuator.active && actuator.timerEnd) {
      const end = new Date(actuator.timerEnd).getTime();
      const updateTimer = () => {
        const diff = Math.floor((end - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [actuator.active, actuator.timerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.irrigationCard, isIrrigating && styles.irrigationCardActive]}
      activeOpacity={0.9}
      onPress={() => onToggle(actuator.id, actuator.active ? 'close' : 'open')}
      disabled={loading}
    >
      <View style={styles.irrigationMainRow}>
        <View style={styles.irrigationIconBox}>
          <Ionicons
            name={actuator.label.toLowerCase().includes('vanne') ? "water-outline" : "construct-outline"}
            size={24}
            color="#4A7C59"
          />
        </View>
        <View style={styles.irrigationTextContainer}>
          <Text style={styles.irrigationTitle}>{actuator.label}</Text>
          <Text style={styles.irrigationSub}>
            {isIrrigating ? 'Irrigation en cours...' : 'Appuyez pour démarrer'}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#4A7C59" />
        ) : (
          <View style={[styles.toggleTrack, isIrrigating && styles.toggleTrackActive]}>
            <View style={[styles.toggleThumb, isIrrigating && styles.toggleThumbActive]}>
              <Ionicons
                name={isIrrigating ? "power" : "power-outline"}
                size={14}
                color={isIrrigating ? "#4A7C59" : "#ADB5BD"}
              />
            </View>
          </View>
        )}
      </View>

      {isIrrigating && timeLeft !== null && timeLeft > 0 && (
        <View style={styles.timerSection}>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.timerUnit}>restantes</Text>
        </View>
      )}

      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  irrigationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
    position: 'relative',
  },
  irrigationCardActive: { backgroundColor: '#EAF2EC', borderColor: '#D5E6DA' },
  irrigationMainRow: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  irrigationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  irrigationTextContainer: { flex: 1 },
  irrigationTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  irrigationSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  toggleTrack: { width: 60, height: 32, borderRadius: 16, backgroundColor: '#F0EAE4', padding: 3 },
  toggleTrackActive: { backgroundColor: '#4A7C59' },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  timerSection: { marginTop: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, zIndex: 2 },
  timerDisplay: { backgroundColor: '#F0EAE4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, minWidth: 140, alignItems: 'center' },
  timerValue: { fontSize: 32, fontWeight: '800', color: '#4A7C59', letterSpacing: 1.5 },
  timerUnit: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  decoCircle1: { position: 'absolute', right: -20, bottom: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(74, 124, 89, 0.02)', zIndex: 1 },
  decoCircle2: { position: 'absolute', right: 20, bottom: -60, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(74, 124, 89, 0.02)', borderWidth: 1, borderColor: 'rgba(74, 124, 89, 0.03)', zIndex: 1 }
});
