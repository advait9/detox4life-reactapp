import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { LibraryFilter } from '../../stores/useLibraryStore';
import { Colors } from '../../constants/colors';

interface FilterBarProps {
  activeFilter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter) => void;
}

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'products', label: 'Products' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'high-risk', label: 'High Risk' },
  { key: 'recent', label: 'Recent' },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = filter.key === activeFilter;
        return (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  chipActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  chipLabel: { fontSize: 14, fontWeight: '500', color: Colors.text.secondary },
  chipLabelActive: { color: '#fff' },
});
