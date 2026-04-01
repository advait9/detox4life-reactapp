import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { StoredScan } from '../../types';
import { ToxicityBadge } from '../analysis/ToxicityBadge';
import { Colors } from '../../constants/colors';

interface ScanCardProps {
  scan: StoredScan;
  onPress: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ScanCard({ scan, onPress }: ScanCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
      <Image
        source={{ uri: scan.image_uri }}
        style={styles.thumbnail}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{scan.name}</Text>
        <Text style={styles.meta}>
          {scan.type === 'product' ? '📦 Product' : '🏠 Room'} · {formatDate(scan.created_at)}
        </Text>
        <View style={styles.footer}>
          <ToxicityBadge level={scan.risk_level} size="sm" />
          <Text style={styles.score}>{scan.overall_score.toFixed(1)}/10</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  name: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  meta: { fontSize: 12, color: Colors.text.secondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  score: { fontSize: 13, fontWeight: '700', color: Colors.brand.primary },
});
