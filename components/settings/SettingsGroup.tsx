import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './constants';

interface SettingsGroupProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  // Flatten and filter children to handle conditional logic and fragments correctly
  const validChildren = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.groupContainer}>
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      <View style={styles.groupCard}>
        {validChildren.map((child, index) => (
          <View key={index}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.childContainer}>
              {child}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  groupCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  childContainer: {
    padding: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAE4',
    marginHorizontal: 20,
    opacity: 0.6,
  },
});
