import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL: string = extra.apiBaseUrl ?? '';
export const API_TOKEN: string = extra.apiToken ?? '';

export const API_ENDPOINTS = {
  analyzeProduct: '/analyze-product',
  analyzeRoom: '/analyze-room',
} as const;

export const IMAGE_CONFIG = {
  maxLongEdge: 1200,
  quality: 0.8,
  maxSizeBytes: 4 * 1024 * 1024, // 4MB
} as const;

export const SCAN_DEBOUNCE_MS = 3000;

export const DB_NAME = 'detox4life.db';
export const DB_VERSION = 1;
