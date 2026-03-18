import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  unit?: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  min,
  max,
  color = '#4A7C59',
  size = 100,
  strokeWidth = 8,
  unit,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Normalize value to percentage (0 to 1)
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8E0D8"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.valueText}>{value === null || isNaN(value) ? '--' : Math.round(value)}</Text>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2C2C',
  },
  unitText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#888',
    marginTop: -2,
  },
});

export default CircularGauge;
