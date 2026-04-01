import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import type { Ingredient, RiskLevel } from '../../types';
import { Colors } from '../../constants/colors';

interface ChemicalCardProps {
  ingredient: Ingredient;
  stated?: boolean;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: Colors.risk.low,
  medium: Colors.risk.moderate,
  high: Colors.risk.high,
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function ChemicalCard({ ingredient, stated = true }: ChemicalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const riskColor = RISK_COLORS[ingredient.healthRisk];

  return (
    <TouchableOpacity
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.8}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{ingredient.name}</Text>
          {!stated && (
            <View style={styles.predictedBadge}>
              <Text style={styles.predictedText}>Predicted</Text>
            </View>
          )}
        </View>
        <View style={[styles.riskPill, { backgroundColor: riskColor + '22', borderColor: riskColor }]}>
          <Text style={[styles.riskLabel, { color: riskColor }]}>
            {RISK_LABELS[ingredient.healthRisk]}
          </Text>
        </View>
      </View>

      {/* Mini bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: ingredient.healthRisk === 'low' ? '33%' : ingredient.healthRisk === 'medium' ? '66%' : '100%',
              backgroundColor: riskColor,
            },
          ]}
        />
      </View>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.reasoning}>{ingredient.reasoning}</Text>
          {ingredient.citation ? (
            <Text style={styles.citation}>Source: {ingredient.citation}</Text>
          ) : null}
        </View>
      )}

      <Text style={styles.expandHint}>{expanded ? '▲ Less' : '▼ More'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, flex: 1 },
  predictedBadge: {
    backgroundColor: '#FFF3CD',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  predictedText: { fontSize: 10, color: '#856404', fontWeight: '600' },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  riskLabel: { fontSize: 11, fontWeight: '700' },
  barTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.ui.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  details: { gap: 6, paddingTop: 4 },
  reasoning: { fontSize: 13, color: Colors.text.secondary, lineHeight: 19 },
  citation: { fontSize: 11, color: Colors.text.secondary, fontStyle: 'italic' },
  expandHint: { fontSize: 11, color: Colors.brand.accent, textAlign: 'right' },
});
