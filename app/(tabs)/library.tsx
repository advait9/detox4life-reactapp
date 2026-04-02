import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchScans, deleteScan } from '../../db/queries';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { ScanCard } from '../../components/library/ScanCard';
import { PendingScanCard } from '../../components/library/PendingScanCard';
import { FilterBar } from '../../components/library/FilterBar';
import { SearchInput } from '../../components/library/SearchInput';
import { Colors } from '../../constants/colors';
import { usePendingScansStore } from '../../stores/usePendingScansStore';
import type { StoredScan, StoredRiskLevel, ScanType } from '../../types';
import type { FetchScansOptions } from '../../db/queries';

// Map UI filter → DB query options
function buildQueryOptions(
  filter: string,
  searchQuery: string,
  sortBy: string,
  sortOrder: string
): FetchScansOptions {
  const opts: FetchScansOptions = {
    search: searchQuery || undefined,
    sortBy: sortBy as FetchScansOptions['sortBy'],
    sortOrder: sortOrder as 'ASC' | 'DESC',
    limit: 200,
  };

  switch (filter) {
    case 'products':
      opts.type = 'product';
      break;
    case 'rooms':
      opts.type = 'room';
      break;
    case 'high-risk':
      opts.riskLevel = 'high';
      break;
    case 'recent':
      opts.sortBy = 'created_at';
      opts.sortOrder = 'DESC';
      opts.limit = 20;
      break;
  }

  return opts;
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const pendingEntries = usePendingScansStore((s) => s.pending);
  const {
    searchQuery,
    activeFilter,
    sortBy,
    sortOrder,
    setSearchQuery,
    setActiveFilter,
  } = useLibraryStore();

  const queryOpts = buildQueryOptions(activeFilter, searchQuery, sortBy, sortOrder);

  const {
    data: scans = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['scans', activeFilter, searchQuery, sortBy, sortOrder],
    queryFn: () => fetchScans(queryOpts),
  });

  const handleDelete = useCallback(
    (scan: StoredScan) => {
      Alert.alert(
        'Delete Scan',
        `Remove "${scan.name}" from your library?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteScan(scan.id);
              queryClient.invalidateQueries({ queryKey: ['scans'] });
              queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
              queryClient.invalidateQueries({ queryKey: ['recentScans'] });
            },
          },
        ]
      );
    },
    [queryClient]
  );

  const renderItem = useCallback(
    ({ item }: { item: StoredScan }) => (
      <SwipeableRow onDelete={() => handleDelete(item)}>
        <ScanCard
          scan={item}
          onPress={() => router.push(`/result/${item.id}`)}
        />
      </SwipeableRow>
    ),
    [handleDelete]
  );

  const totalCount = scans.length + pendingEntries.length;

  const ListHeader = (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Library</Text>
      <Text style={styles.subtitle}>{totalCount} scan{totalCount !== 1 ? 's' : ''}</Text>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, category…"
      />
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      {pendingEntries.length > 0 && (
        <View style={styles.pendingSection}>
          {pendingEntries.map((entry) => (
            <PendingScanCard key={entry.id} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔬</Text>
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptyDesc}>
        {searchQuery || activeFilter !== 'all'
          ? 'No scans match your current filters.'
          : 'Start scanning products and rooms to build your library.'}
      </Text>
      {!searchQuery && activeFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyCta}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Text style={styles.emptyCtaText}>Start Scanning</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlashList
        data={scans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={100}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={isLoading ? null : ListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Swipeable Row (tap-to-delete via long press for simplicity) ──────────────

function SwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity
      onLongPress={onDelete}
      delayLongPress={600}
      activeOpacity={1}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: 16, gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text.primary, marginBottom: 2 },
  subtitle: { fontSize: 14, color: Colors.text.secondary, marginBottom: 10 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  pendingSection: { marginTop: 8 },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  emptyDesc: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyCta: {
    marginTop: 16,
    backgroundColor: Colors.brand.primary,
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  emptyCtaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
