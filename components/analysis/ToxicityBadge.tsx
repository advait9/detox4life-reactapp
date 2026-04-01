import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StoredRiskLevel } from '../../types';
import { Colors, getRiskColor } from '../../constants/colors';

interface ToxicityBadgeProps {
  level: StoredRiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const LABELS: Record<StoredRiskLevel, string> = {
  safe: 'Safe',
  low: 'Low Risk',
  moderate: 'Moderate',
  high: 'High Risk',
  critical: 'Critical',
};

export function ToxicityBadge({ level, size = 'md' }: ToxicityBadgeProps) {
  const color = getRiskColor(level);
  const label = LABELS[level];

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        { backgroundColor: color + '22', borderColor: color },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          size === 'lg' && styles.labelLg,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  lg: { paddingHorizontal: 14, paddingVertical: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 13, fontWeight: '600' },
  labelSm: { fontSize: 11 },
  labelLg: { fontSize: 15 },
});
