import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import api from '../services/api';
import { processImageForUpload, saveImageToDocuments, buildFormData } from '../services/image';
import { API_ENDPOINTS } from '../constants/config';
import { insertScan } from '../db/queries';
import { usePendingScansStore } from '../stores/usePendingScansStore';
import { useCameraStore } from '../stores/useCameraStore';
import type { PendingEntry } from '../stores/usePendingScansStore';
import type { ProductAnalysisResponse, RoomAnalysisResponse, StoredRiskLevel } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeProductScore(response: ProductAnalysisResponse): number {
  const all = [...response.StatedIngredients, ...response.UnstatedIngredients];
  if (all.length === 0) return 1;
  const riskValues = { low: 2, medium: 5.5, high: 9 } as const;
  const avg = all.reduce((sum, i) => sum + (riskValues[i.healthRisk] ?? 2), 0) / all.length;
  return Math.round(Math.min(10, Math.max(1, avg)) * 10) / 10;
}

function computeRoomScore(response: RoomAnalysisResponse): number {
  const riskValues = { low: 2, medium: 5.5, high: 9 } as const;
  return riskValues[response.roomOverallRisk] ?? 5;
}

function toStoredRiskLevel(score: number): StoredRiskLevel {
  if (score <= 3) return 'safe';
  if (score <= 5) return 'low';
  if (score <= 7) return 'moderate';
  if (score <= 9) return 'high';
  return 'critical';
}

export function useProductAnalysis() {
  const queryClient = useQueryClient();
  const { addPending, completePending, failPending } = usePendingScansStore();

  const analyze = useCallback(
    async (photoUri: string) => {
      const id = generateId();
      const now = new Date().toISOString();

      // Save image to permanent storage first so the pending card has a valid URI
      const savedImageUri = await saveImageToDocuments(photoUri);

      // Register in pending store and navigate away immediately
      addPending({ id, type: 'product', imageUri: savedImageUri, createdAt: now, status: 'analyzing' });
      router.back();

      // API call runs in background — not awaited at call site
      processImageForUpload(photoUri)
        .then(async (processed) => {
          const formData = buildFormData(processed.uri);
          const { data: response } = await api.post<ProductAnalysisResponse>(
            API_ENDPOINTS.analyzeProduct,
            formData
          );

          const score = computeProductScore(response);
          const riskLevel = toStoredRiskLevel(score);

          await insertScan({
            id,
            type: 'product',
            name: response.ProductName,
            image_uri: savedImageUri,
            overall_score: score,
            risk_level: riskLevel,
            response_json: JSON.stringify(response),
            analyzed_at: now,
            created_at: now,
          });

          queryClient.invalidateQueries({ queryKey: ['scans'] });
          queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
          queryClient.invalidateQueries({ queryKey: ['recentScans'] });
          completePending(id);
        })
        .catch((err: Error) => {
          failPending(id, err.message);
        });
    },
    [queryClient, addPending, completePending, failPending]
  );

  return { analyze };
}

export function useRoomAnalysis() {
  const queryClient = useQueryClient();
  const { addPending, completePending, failPending } = usePendingScansStore();
  const { roomType } = useCameraStore();

  const analyze = useCallback(
    async (photoUri: string) => {
      const id = generateId();
      const now = new Date().toISOString();

      const savedImageUri = await saveImageToDocuments(photoUri);

      addPending({ id, type: 'room', imageUri: savedImageUri, createdAt: now, status: 'analyzing' });
      router.back();

      processImageForUpload(photoUri)
        .then(async (processed) => {
          const formData = buildFormData(processed.uri);
          const { data: response } = await api.post<RoomAnalysisResponse>(
            API_ENDPOINTS.analyzeRoom,
            formData
          );

          const score = computeRoomScore(response);
          const riskLevel = toStoredRiskLevel(score);

          await insertScan({
            id,
            type: 'room',
            name: response.roomType,
            image_uri: savedImageUri,
            overall_score: score,
            risk_level: riskLevel,
            response_json: JSON.stringify(response),
            analyzed_at: now,
            created_at: now,
          });

          queryClient.invalidateQueries({ queryKey: ['scans'] });
          queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
          queryClient.invalidateQueries({ queryKey: ['recentScans'] });
          completePending(id);
        })
        .catch((err: Error) => {
          failPending(id, err.message);
        });
    },
    [queryClient, addPending, completePending, failPending, roomType]
  );

  return { analyze };
}

export function useRetryAnalysis() {
  const queryClient = useQueryClient();
  const { retryPending, completePending, failPending } = usePendingScansStore();

  const retry = useCallback(
    (entry: PendingEntry) => {
      retryPending(entry.id);

      processImageForUpload(entry.imageUri)
        .then(async (processed) => {
          const formData = buildFormData(processed.uri);
          const endpoint =
            entry.type === 'product' ? API_ENDPOINTS.analyzeProduct : API_ENDPOINTS.analyzeRoom;

          const { data: response } = await api.post<ProductAnalysisResponse | RoomAnalysisResponse>(
            endpoint,
            formData
          );

          let score: number;
          let name: string;

          if (entry.type === 'product') {
            const r = response as ProductAnalysisResponse;
            score = computeProductScore(r);
            name = r.ProductName;
          } else {
            const r = response as RoomAnalysisResponse;
            score = computeRoomScore(r);
            name = r.roomType;
          }

          const riskLevel = toStoredRiskLevel(score);
          const now = new Date().toISOString();

          await insertScan({
            id: entry.id,
            type: entry.type,
            name,
            image_uri: entry.imageUri,
            overall_score: score,
            risk_level: riskLevel,
            response_json: JSON.stringify(response),
            analyzed_at: now,
            created_at: entry.createdAt,
          });

          queryClient.invalidateQueries({ queryKey: ['scans'] });
          queryClient.invalidateQueries({ queryKey: ['libraryStats'] });
          queryClient.invalidateQueries({ queryKey: ['recentScans'] });
          completePending(entry.id);
        })
        .catch((err: Error) => {
          failPending(entry.id, err.message);
        });
    },
    [queryClient, retryPending, completePending, failPending]
  );

  return { retry };
}
