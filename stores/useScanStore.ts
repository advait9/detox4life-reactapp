import { create } from 'zustand';
import type { ScanPhase, ProductAnalysisResponse, RoomAnalysisResponse, ScanType } from '../types';

interface ScanResult {
  id: string;
  type: ScanType;
  name: string;
  imageUri: string;
  overallScore: number;
  response: ProductAnalysisResponse | RoomAnalysisResponse;
  analyzedAt: string;
}

interface ScanState {
  phase: ScanPhase;
  currentResult: ScanResult | null;
  error: string | null;
  capturedImageUri: string | null;

  setPhase: (phase: ScanPhase) => void;
  setCapturedImage: (uri: string) => void;
  setResult: (result: ScanResult) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as ScanPhase,
  currentResult: null,
  error: null,
  capturedImageUri: null,
};

export const useScanStore = create<ScanState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setCapturedImage: (uri) =>
    set({ capturedImageUri: uri, phase: 'capturing' }),

  setResult: (result) =>
    set({ currentResult: result, phase: 'complete', error: null }),

  setError: (error) => set({ error, phase: 'error' }),

  reset: () => set(initialState),
}));
