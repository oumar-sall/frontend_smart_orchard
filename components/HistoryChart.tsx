import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChartProps {
  data: any[];
  title: string;
  color: string;
  unit: string;
  icon: string;
}

const HistoryChart = ({ data, title, color, unit, icon }: ChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.card, { height: 100, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#8E8E93', fontSize: 13, fontWeight: '600' }}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const chartData = [...data].reverse().map(item => ({
    value: item.value === '--' ? 0 : Number(item.value),
    label: item.label,
  }));

  const CARD_PADDING = 18;
  const Y_AXIS_WIDTH = 35;
  const CONTAINER_WIDTH = SCREEN_WIDTH - (CARD_PADDING * 2);
  const INITIAL_SPACING = 10;
  const END_SPACING = 20; 
  
  const chartHeight = 160;
  const chartWidth = CONTAINER_WIDTH - Y_AXIS_WIDTH - 20;
  const spacing = (chartWidth - INITIAL_SPACING - END_SPACING) / (chartData.length - 1 || 1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          initialSpacing={INITIAL_SPACING}
          endSpacing={END_SPACING}
          spacing={spacing}
          color={color}
          thickness={4}
          curved
          isAnimated
          animationDuration={1000}
          areaChart
          startFillColor={color}
          endFillColor="white"
          startOpacity={0.2}
          endOpacity={0.01}
          hideDataPoints={false}
          dataPointsColor={color}
          dataPointsRadius={4}
          noOfSections={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#F0EAE4"
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          yAxisLabelWidth={Y_AXIS_WIDTH}
          hideRules={false}
          rulesType="solid"
          rulesColor="rgba(0,0,0,0.03)"
          
          pointerConfig={{
            pointerStripHeight: chartHeight,
            pointerStripColor: '#8E8E93',
            pointerStripWidth: 1,
            strokeDashArray: [5, 5],
            pointerColor: color,
            radius: 5,
            pointerLabelComponent: (items: any) => (
              <View style={[styles.pointerLabel, { borderColor: color }]}>
                <Text style={styles.pointerValue}>{items[0].value}{unit}</Text>
                <Text style={styles.pointerDate}>{items[0].label}</Text>
              </View>
            ),
            pointerLabelWidth: 80,
            pointerLabelHeight: 50,
            shiftPointerLabelY: -60,
            autoAdjustPointerLabelPosition: true,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    // Added safety padding at the top
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    paddingHorizontal: 4,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chartWrapper: {
    marginLeft: -10,
    alignItems: 'center',
  },
  axisText: {
    color: '#8E8E93',
    fontSize: 9,
    fontWeight: '600',
  },
  pointerLabel: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  pointerDate: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8E8E93',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

export default HistoryChart;
