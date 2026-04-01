import React from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface SettingSliderProps {
  label: string;
  icon: string;
  iconColor: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onValueChange: (val: number) => void;
  formatValue?: (val: number) => string | number;
  disabled?: boolean;
}

export const SettingSlider = React.memo(({
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
}: SettingSliderProps) => {
  const [localVal, setLocalVal] = React.useState(value);
  const [isDragging, setIsDragging] = React.useState(false);
  const trackRef = React.useRef<View>(null);
  const trackLayout = React.useRef({ x: 0, width: 0 });

  // Animation pour le scale du thumb
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!isDragging) {
      setLocalVal(value);
    }
  }, [value, isDragging]);

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isDragging ? 1.3 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isDragging, scaleAnim]);

  const updateValueFromPos = React.useCallback((pageX: number) => {
    if (disabled || trackLayout.current.width <= 0) return;

    const relativeX = pageX - trackLayout.current.x;
    let percent = Math.max(0, Math.min(1, relativeX / trackLayout.current.width));
    
    let newValue = min + percent * (max - min);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    if (newValue !== localVal) {
      setLocalVal(newValue);
      onValueChange(newValue);
    }
  }, [disabled, min, max, step, localVal, onValueChange]);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (e) => {
      const pageX = e.nativeEvent.pageX; // Capture coordinates before the async measure call
      setIsDragging(true);
      trackRef.current?.measure((x, y, width, height, px, py) => {
        trackLayout.current = { x: px, width };
        updateValueFromPos(pageX);
      });
    },
    onPanResponderMove: (e) => {
      updateValueFromPos(e.nativeEvent.pageX);
    },
    onPanResponderRelease: () => setIsDragging(false),
    onPanResponderTerminate: () => setIsDragging(false),
  }), [disabled, updateValueFromPos]);

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
          ref={trackRef}
          style={[styles.sliderTrack, disabled && { backgroundColor: '#EBEBEB' }]}
          onLayout={() => {
            // Initial measure on layout to get the correct absolute position
            trackRef.current?.measure((x, y, width, height, pageX, pageY) => {
               if (width > 0) {
                 trackLayout.current = { x: pageX, width };
               }
            });
          }}
          {...panResponder.panHandlers}
        >
          <View pointerEvents="none" style={[styles.sliderFill, { width: `${progress * 100}%`, backgroundColor: trackColor }]} />
          <Animated.View 
            pointerEvents="none" 
            style={[
              styles.sliderThumb, 
              { 
                left: `${progress * 100}%`, 
                borderColor: trackColor,
                transform: [{ scale: scaleAnim }]
              }
            ]} 
          />
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

export default SettingSlider;

const styles = StyleSheet.create({
  settingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  settingCardDisabled: { opacity: 0.6 },
  settingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  settingValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  unit: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  sliderContainer: { marginTop: 4 },
  sliderTrack: {
    height: 8,
    backgroundColor: '#F0EAE4',
    borderRadius: 4,
    justifyContent: 'center',
    marginBottom: 8,
  },
  sliderFill: { height: '100%', borderRadius: 4 },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    borderWidth: 3,
    marginLeft: -11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLimit: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
});
