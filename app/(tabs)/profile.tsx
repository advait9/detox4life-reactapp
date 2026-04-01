import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchLibraryStats, deleteAllScans } from '../../db/queries';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const { data: stats, refetch } = useQuery({
    queryKey: ['libraryStats'],
    queryFn: fetchLibraryStats,
  });

  const handleClearLibrary = () => {
    Alert.alert(
      'Clear Library',
      'This will permanently delete all your scan history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await deleteAllScans();
            refetch();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.title}>Profile</Text>

      {/* Avatar placeholder */}
      <Card style={styles.avatarCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🌿</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>Guest User</Text>
            <Text style={styles.avatarSub}>Sign-in coming soon</Text>
          </View>
        </View>
      </Card>

      {/* Exposure Summary */}
      <Text style={styles.sectionTitle}>Exposure Summary</Text>
      <View style={styles.statsGrid}>
        <StatBox label="Total Scans" value={String(stats?.totalScans ?? 0)} icon="📊" />
        <StatBox
          label="Avg Score"
          value={stats?.averageScore ? stats.averageScore.toFixed(1) : '–'}
          icon="⚖️"
        />
        <StatBox
          label="High Risk"
          value={String(stats?.highRiskCount ?? 0)}
          icon="⚠️"
          valueColor={Colors.risk.high}
        />
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <Card style={styles.settingsCard}>
        <SettingsRow label="Notifications" value="Coming soon" />
        <View style={styles.divider} />
        <SettingsRow label="Dark Mode" value="System" />
        <View style={styles.divider} />
        <SettingsRow label="Data Export" value="Coming soon" />
      </Card>

      {/* Danger zone */}
      <Text style={styles.sectionTitle}>Data</Text>
      <Card style={styles.settingsCard}>
        <Button
          label="Clear Scan Library"
          variant="danger"
          onPress={handleClearLibrary}
          size="md"
        />
      </Card>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.settingsCard}>
        <SettingsRow label="App Version" value="1.0.0" />
        <View style={styles.divider} />
        <SettingsRow label="API" value="api.detox4.life" />
        <View style={styles.divider} />
        <SettingsRow label="Privacy Policy" value="→" />
        <View style={styles.divider} />
        <SettingsRow label="Terms of Service" value="→" />
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: 16, gap: 4 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 16 },
  avatarCard: { marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  avatarInfo: { gap: 4 },
  avatarName: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  avatarSub: { fontSize: 13, color: Colors.text.secondary },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 20, marginBottom: 8 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.brand.primary },
  statLabel: { fontSize: 11, color: Colors.text.secondary, textAlign: 'center' },
  settingsCard: { gap: 0, padding: 0 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  settingsLabel: { fontSize: 15, color: Colors.text.primary },
  settingsValue: { fontSize: 14, color: Colors.text.secondary },
  divider: { height: 1, backgroundColor: Colors.ui.border, marginHorizontal: 16 },
});
