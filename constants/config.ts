export const API_BASE_URL = 'https://api.detox4.life/api';
export const API_TOKEN = '3KfdKROcXjJC0qJnYbvjlBv6zmC9w5vl';

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
