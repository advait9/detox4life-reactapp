import { create } from 'zustand';
import type { ScanType, StoredRiskLevel } from '../types';

export type LibraryFilter = 'all' | 'products' | 'rooms' | 'high-risk' | 'recent';
export type LibrarySortBy = 'created_at' | 'overall_score' | 'risk_level';
export type LibrarySortOrder = 'ASC' | 'DESC';

interface LibraryState {
  searchQuery: string;
  activeFilter: LibraryFilter;
  sortBy: LibrarySortBy;
  sortOrder: LibrarySortOrder;

  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: LibraryFilter) => void;
  setSortBy: (sortBy: LibrarySortBy) => void;
  setSortOrder: (order: LibrarySortOrder) => void;
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  activeFilter: 'all' as LibraryFilter,
  sortBy: 'created_at' as LibrarySortBy,
  sortOrder: 'DESC' as LibrarySortOrder,
};

export const useLibraryStore = create<LibraryState>((set) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  reset: () => set(initialState),
}));
