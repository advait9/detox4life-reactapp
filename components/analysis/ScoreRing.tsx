import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getScoreColor, getRiskLevelFromScore } from '../../constants/colors';
import { Colors } from '../../constants/colors';

interface ScoreRingProps {
  score: number; // 1–10
  size?: number;
  animate?: boolean;
}

export function ScoreRing({ score, size = 120, animate = true }: ScoreRingProps) {
  const animatedScore = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const listener = animatedScore.addListener(({ value }) => {
      setDisplayScore(Math.round(value * 10) / 10);
    });
    Animated.timing(animatedScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => animatedScore.removeListener(listener);
  }, [score, animate]);

  const color = getScoreColor(score);
  const riskLevel = getRiskLevelFromScore(score);
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((score - 1) / 9) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: Colors.bg.secondary,
          },
        ]}
      />
      {/* Score text */}
      <View style={styles.center}>
        <Text style={[styles.score, { fontSize: size * 0.32, color }]}>
          {displayScore.toFixed(1)}
        </Text>
        <Text style={[styles.label, { fontSize: size * 0.1 }]}>/ 10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  center: { alignItems: 'center' },
  score: { fontWeight: 'bold', letterSpacing: -1 },
  label: { color: Colors.text.secondary, fontWeight: '500' },
});
