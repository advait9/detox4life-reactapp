import { create } from 'zustand';
import type { ScanType } from '../types';

export interface PendingEntry {
  id: string;
  type: ScanType;
  imageUri: string;
  createdAt: string;
  status: 'analyzing' | 'error';
  errorMessage?: string;
}

interface PendingScansState {
  pending: PendingEntry[];
  addPending: (entry: PendingEntry) => void;
  completePending: (id: string) => void;
  failPending: (id: string, message: string) => void;
  retryPending: (id: string) => void;
}

export const usePendingScansStore = create<PendingScansState>((set) => ({
  pending: [],

  addPending: (entry) =>
    set((s) => ({ pending: [entry, ...s.pending] })),

  completePending: (id) =>
    set((s) => ({ pending: s.pending.filter((e) => e.id !== id) })),

  failPending: (id, message) =>
    set((s) => ({
      pending: s.pending.map((e) =>
        e.id === id ? { ...e, status: 'error', errorMessage: message } : e
      ),
    })),

  retryPending: (id) =>
    set((s) => ({
      pending: s.pending.map((e) =>
        e.id === id ? { ...e, status: 'analyzing', errorMessage: undefined } : e
      ),
    })),
}));
