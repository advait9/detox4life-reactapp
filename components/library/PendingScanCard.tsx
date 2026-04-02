import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { PendingEntry } from '../../stores/usePendingScansStore';
import { useRetryAnalysis } from '../../hooks/useAnalysis';

const PROGRESS_DURATION_MS = 30_000;
// Animate to 99% over the full duration; hold there until API completes
const TARGET_PROGRESS = 0.99;

interface PendingScanCardProps {
  entry: PendingEntry;
}

export function PendingScanCard({ entry }: PendingScanCardProps) {
  const { retry } = useRetryAnalysis();
  const progress = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (entry.status === 'analyzing') {
      animation.current = Animated.timing(progress, {
        toValue: TARGET_PROGRESS,
        duration: PROGRESS_DURATION_MS,
        useNativeDriver: false,
      });
      animation.current.start();
    }
    return () => {
      animation.current?.stop();
    };
  }, [entry.status]);

  const isError = entry.status === 'error';
  const label = entry.type === 'product' ? '📦 Product' : '🏠 Room';

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <Image source={{ uri: entry.imageUri }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {isError ? 'Analysis failed' : 'Analyzing…'}
        </Text>
        <Text style={styles.meta}>
          {label} · Just now
        </Text>

        {isError ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText} numberOfLines={1}>
              {entry.errorMessage ?? 'Something went wrong'}
            </Text>
            <TouchableOpacity onPress={() => retry(entry)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: barWidth }]} />
            </View>
            <Text style={styles.progressLabel}>Processing</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
    marginBottom: 10,
    opacity: 0.9,
  },
  thumbnail: {
    width: 88,
    height: 88,
    backgroundColor: Colors.bg.secondary,
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  meta: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  progressContainer: {
    gap: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#dc2626',
  },
  retryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.brand.primary,
  },
  retryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
