import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchScanById } from '../../db/queries';
import { useScanStore } from '../../stores/useScanStore';
import { ScoreRing } from '../../components/analysis/ScoreRing';
import { ToxicityBadge } from '../../components/analysis/ToxicityBadge';
import { ChemicalCard } from '../../components/analysis/ChemicalCard';
import { RiskMeter } from '../../components/analysis/RiskMeter';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, getRiskColor } from '../../constants/colors';
import type {
  ProductAnalysisResponse,
  RoomAnalysisResponse,
  RoomItem,
  StoredScan,
} from '../../types';

const ANALYZING_MESSAGES = [
  'Analyzing ingredients…',
  'Checking toxicity database…',
  'Generating safer alternatives…',
  'Scoring chemical risks…',
  'Almost done…',
];

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { phase, error: scanError } = useScanStore();

  const { data: scan, isLoading } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => fetchScanById(id),
    enabled: !!id && phase === 'complete',
    retry: 3,
    retryDelay: 500,
  });

  // Loading / analyzing state
  if (phase === 'uploading' || phase === 'analyzing' || phase === 'capturing') {
    return <AnalyzingScreen />;
  }

  // Error state
  if (phase === 'error' || scanError) {
    return (
      <ErrorScreen
        message={scanError ?? 'Something went wrong.'}
        onRetry={() => router.back()}
      />
    );
  }

  if (isLoading || !scan) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator color={Colors.brand.primary} size="large" />
      </View>
    );
  }

  return scan.type === 'product' ? (
    <ProductResult scan={scan} insets={insets} />
  ) : (
    <RoomResult scan={scan} insets={insets} />
  );
}

// ─── Analyzing Screen ─────────────────────────────────────────────────────────

function AnalyzingScreen() {
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % ANALYZING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.analyzingScreen}>
      <Text style={styles.analyzingEmoji}>🔬</Text>
      <ActivityIndicator color={Colors.brand.primary} size="large" style={{ marginBottom: 16 }} />
      <Text style={styles.analyzingMessage}>{ANALYZING_MESSAGES[msgIndex]}</Text>
      <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
    </View>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.centred}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorTitle}>Analysis Failed</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <Button label="Try Again" onPress={onRetry} style={{ marginTop: 20 }} />
    </View>
  );
}

// ─── Product Result ───────────────────────────────────────────────────────────

function ProductResult({ scan, insets }: { scan: StoredScan; insets: ReturnType<typeof useSafeAreaInsets> }) {
  const response: ProductAnalysisResponse = JSON.parse(scan.response_json);

  const handleShare = async () => {
    await Share.share({
      message: `I scanned ${scan.name} with Detox 4 Life. Risk score: ${scan.overall_score.toFixed(1)}/10 (${scan.risk_level}). Check your products for harmful chemicals!`,
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      {/* Product header */}
      <View style={styles.productHeader}>
        <Image source={{ uri: scan.image_uri }} style={styles.productThumb} />
        <View style={styles.productMeta}>
          <Text style={styles.productName}>{response.ProductName}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{response.ProductCategory}</Text>
          </View>
          <Text style={styles.locationText}>📍 {response.TypicalLocation}</Text>
        </View>
      </View>

      {/* Score */}
      <Card elevated style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <ScoreRing score={scan.overall_score} size={100} />
          <View style={styles.scoreDetails}>
            <ToxicityBadge level={scan.risk_level} size="lg" />
            <RiskMeter score={scan.overall_score} width={160} />
          </View>
        </View>
      </Card>

      {/* Stated ingredients */}
      {response.StatedIngredients.length > 0 && (
        <Section title={`Stated Ingredients (${response.StatedIngredients.length})`}>
          {response.StatedIngredients.map((ing, i) => (
            <ChemicalCard key={i} ingredient={ing} stated />
          ))}
        </Section>
      )}

      {/* Unstated / predicted ingredients */}
      {response.UnstatedIngredients.length > 0 && (
        <Section title={`Predicted Unlisted (${response.UnstatedIngredients.length})`}>
          {response.UnstatedIngredients.map((ing, i) => (
            <ChemicalCard key={i} ingredient={ing} stated={false} />
          ))}
        </Section>
      )}

      {/* Action bar */}
      <View style={styles.actionBar}>
        <Button label="Share" variant="secondary" onPress={handleShare} style={{ flex: 1 }} />
        <Button
          label="Scan Another"
          variant="primary"
          onPress={() => router.push('/scan/product')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

// ─── Room Result ──────────────────────────────────────────────────────────────

function RoomResult({ scan, insets }: { scan: StoredScan; insets: ReturnType<typeof useSafeAreaInsets> }) {
  const response: RoomAnalysisResponse = JSON.parse(scan.response_json);

  const handleShare = async () => {
    await Share.share({
      message: `I scanned my ${response.roomType} with Detox 4 Life. Overall risk: ${response.roomOverallRisk.toUpperCase()}. ${response.items.length} items identified. Keep your home chemical-safe!`,
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>‹ Back</Text>
      </TouchableOpacity>

      {/* Room header */}
      <View style={styles.productHeader}>
        <Image source={{ uri: scan.image_uri }} style={styles.productThumb} />
        <View style={styles.productMeta}>
          <Text style={styles.productName}>{response.roomType}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>Room Scan</Text>
          </View>
          <Text style={styles.locationText}>🏠 {response.items.length} items found</Text>
        </View>
      </View>

      {/* Aggregate score */}
      <Card elevated style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <ScoreRing score={scan.overall_score} size={100} />
          <View style={styles.scoreDetails}>
            <ToxicityBadge level={scan.risk_level} size="lg" />
            <RiskMeter score={scan.overall_score} width={160} />
          </View>
        </View>
      </Card>

      {/* Items grid */}
      {response.items.length > 0 && (
        <Section title={`Identified Items (${response.items.length})`}>
          <View style={styles.itemsGrid}>
            {response.items.map((item, i) => (
              <RoomItemCard key={i} item={item} />
            ))}
          </View>
        </Section>
      )}

      {/* Action bar */}
      <View style={styles.actionBar}>
        <Button label="Share" variant="secondary" onPress={handleShare} style={{ flex: 1 }} />
        <Button
          label="Scan Another Room"
          variant="primary"
          onPress={() => router.push('/scan/room')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

// ─── Room Item Card ───────────────────────────────────────────────────────────

function RoomItemCard({ item }: { item: RoomItem }) {
  const [expanded, setExpanded] = React.useState(false);
  const riskColor = getRiskColor(
    item.overallRisk === 'low' ? 'low' : item.overallRisk === 'medium' ? 'moderate' : 'high'
  );

  return (
    <TouchableOpacity
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.8}
      style={styles.roomItemCard}
    >
      <View style={styles.roomItemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomItemName}>{item.itemName}</Text>
          {item.brand && <Text style={styles.roomItemBrand}>{item.brand}</Text>}
        </View>
        <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
      </View>
      <View style={styles.roomItemCategory}>
        <Text style={styles.roomItemCategoryText}>{item.itemCategory}</Text>
      </View>
      {expanded && item.chemicals.length > 0 && (
        <View style={styles.chemicalsList}>
          {item.chemicals.slice(0, 3).map((chem, i) => (
            <View key={i} style={styles.chemRow}>
              <Text style={styles.chemName}>{chem.name}</Text>
              <Text
                style={[
                  styles.chemRisk,
                  {
                    color:
                      chem.healthRisk === 'high'
                        ? Colors.risk.high
                        : chem.healthRisk === 'medium'
                        ? Colors.risk.moderate
                        : Colors.risk.safe,
                  },
                ]}
              >
                {chem.healthRisk}
              </Text>
            </View>
          ))}
          {item.chemicals.length > 3 && (
            <Text style={styles.moreChems}>+{item.chemicals.length - 3} more</Text>
          )}
        </View>
      )}
      <Text style={styles.expandHint}>{expanded ? '▲' : '▼'}</Text>
    </TouchableOpacity>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingHorizontal: 16, gap: 4 },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },

  analyzingScreen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  analyzingEmoji: { fontSize: 64, marginBottom: 8 },
  analyzingMessage: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, textAlign: 'center' },
  analyzingSubtext: { fontSize: 14, color: Colors.text.secondary },

  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  errorMessage: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },

  backBtn: { paddingVertical: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: Colors.brand.primary, fontWeight: '500' },

  productHeader: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  productThumb: { width: 88, height: 88, borderRadius: 10, backgroundColor: Colors.bg.secondary },
  productMeta: { flex: 1, gap: 6, justifyContent: 'center' },
  productName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.light,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: Colors.brand.dark },
  locationText: { fontSize: 13, color: Colors.text.secondary },

  scoreCard: { marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreDetails: { flex: 1, gap: 14 },

  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 10 },
  sectionContent: { gap: 8 },

  itemsGrid: { gap: 10 },
  roomItemCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  roomItemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  roomItemName: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  roomItemBrand: { fontSize: 12, color: Colors.text.secondary },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  roomItemCategory: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomItemCategoryText: { fontSize: 11, fontWeight: '600', color: Colors.brand.dark },
  chemicalsList: { gap: 5, paddingTop: 4 },
  chemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chemName: { fontSize: 12, color: Colors.text.primary, flex: 1 },
  chemRisk: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  moreChems: { fontSize: 11, color: Colors.text.secondary, fontStyle: 'italic' },
  expandHint: { fontSize: 11, color: Colors.brand.accent, textAlign: 'right' },

  actionBar: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
