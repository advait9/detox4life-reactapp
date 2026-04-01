import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getScoreColor } from '../../constants/colors';

interface RiskMeterProps {
  score: number; // 1–10
  width?: number;
}

export function RiskMeter({ score, width = 200 }: RiskMeterProps) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const percentage = ((clampedScore - 1) / 9) * 100;
  const color = getScoreColor(clampedScore);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>Safe</Text>
        <Text style={[styles.scoreText, { color }]}>{clampedScore.toFixed(1)}</Text>
        <Text style={styles.labelText}>Critical</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bg.secondary,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelText: { fontSize: 11, color: Colors.text.secondary },
  scoreText: { fontSize: 13, fontWeight: '700' },
});
