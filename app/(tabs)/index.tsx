import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentScans, fetchLibraryStats, fetchWeeklyTrend } from '../../db/queries';
import { ScoreRing } from '../../components/analysis/ScoreRing';
import { ToxicityBadge } from '../../components/analysis/ToxicityBadge';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/colors';
import type { StoredScan } from '../../types';

const TIPS = [
  'Check personal care products for parabens and phthalates.',
  'Ventilate rooms when using cleaning products.',
  'Choose fragrance-free options when possible.',
  'Look for BPA-free food containers.',
  'Wash hands after handling receipts — they often contain BPA.',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  const { data: recentScans = [] } = useQuery({
    queryKey: ['recentScans'],
    queryFn: () => fetchRecentScans(5),
  });

  const { data: stats } = useQuery({
    queryKey: ['libraryStats'],
    queryFn: fetchLibraryStats,
  });

  const { data: weeklyTrend = [] } = useQuery({
    queryKey: ['weeklyTrend'],
    queryFn: fetchWeeklyTrend,
  });

  const avgScore = stats?.averageScore ?? 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.subheading}>Your chemical exposure today</Text>
        </View>
      </View>

      {/* Hero gauge card */}
      <Card elevated style={styles.heroCard}>
        <View style={styles.gaugeRow}>
          <ScoreRing score={avgScore > 0 ? avgScore : 5} size={130} />
          <View style={styles.gaugeStats}>
            <StatItem label="Total Scans" value={String(stats?.totalScans ?? 0)} />
            <StatItem label="High Risk Items" value={String(stats?.highRiskCount ?? 0)} color={Colors.risk.high} />
            <StatItem label="Avg Score" value={avgScore > 0 ? avgScore.toFixed(1) : '–'} />
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Scan</Text>
      </View>
      <View style={styles.quickActions}>
        <QuickAction
          icon="📦"
          label="Scan Product"
          onPress={() => router.push('/scan/product')}
        />
        <QuickAction
          icon="🏠"
          label="Scan Room"
          onPress={() => router.push('/scan/room')}
        />
      </View>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/library')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentScans}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recentList}
            renderItem={({ item }) => (
              <RecentScanCard
                scan={item}
                onPress={() => router.push(`/result/${item.id}`)}
              />
            )}
          />
        </>
      )}

      {/* Weekly trend (simple bar chart) */}
      {weeklyTrend.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>7-Day Trend</Text>
          </View>
          <Card style={styles.trendCard}>
            <View style={styles.barsRow}>
              {weeklyTrend.map((day) => (
                <View key={day.date} style={styles.barCol}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        height: Math.max(8, (day.avgScore / 10) * 60),
                        backgroundColor: day.avgScore <= 5 ? Colors.risk.safe : Colors.risk.high,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}

      {/* Tip card */}
      <Card style={styles.tipCard}>
        <Text style={styles.tipHeading}>💡 Daily Tip</Text>
        <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.quickBtn}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function RecentScanCard({
  scan,
  onPress,
}: {
  scan: StoredScan;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.recentCard}>
      <Image source={{ uri: scan.image_uri }} style={styles.recentThumb} />
      <Text style={styles.recentName} numberOfLines={2}>{scan.name}</Text>
      <ToxicityBadge level={scan.risk_level} size="sm" />
      <Text style={styles.recentScore}>{scan.overall_score.toFixed(1)}/10</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: 16, gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: Colors.text.primary },
  subheading: { fontSize: 14, color: Colors.text.secondary, marginTop: 2 },
  heroCard: { marginBottom: 20 },
  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  gaugeStats: { flex: 1, gap: 12 },
  statItem: { gap: 2 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.brand.primary },
  statLabel: { fontSize: 12, color: Colors.text.secondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  seeAll: { fontSize: 14, color: Colors.brand.accent },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.brand.light,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  quickIcon: { fontSize: 30 },
  quickLabel: { fontSize: 14, fontWeight: '600', color: Colors.brand.dark },
  recentList: { paddingRight: 16, gap: 10 },
  recentCard: {
    width: 130,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  recentThumb: {
    width: '100%',
    height: 70,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 8,
  },
  recentName: { fontSize: 13, fontWeight: '600', color: Colors.text.primary },
  recentScore: { fontSize: 13, fontWeight: '700', color: Colors.brand.primary },
  trendCard: { marginBottom: 16 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 80 },
  barCol: { alignItems: 'center', gap: 4 },
  trendBar: { width: 28, borderRadius: 4, minHeight: 8 },
  barLabel: { fontSize: 10, color: Colors.text.secondary },
  tipCard: { backgroundColor: Colors.brand.light, borderColor: Colors.brand.accent, marginBottom: 8 },
  tipHeading: { fontSize: 14, fontWeight: '700', color: Colors.brand.dark, marginBottom: 6 },
  tipText: { fontSize: 14, color: Colors.brand.dark, lineHeight: 21 },
});
