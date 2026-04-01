import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { analyzeProduct, analyzeRoom } from '../services/analyze';
import { insertScan } from '../db/queries';
import { useScanStore } from '../stores/useScanStore';
import type { ProductAnalysisResponse, RoomAnalysisResponse, StoredRiskLevel } from '../types';
import { getRiskLevelFromApiRisk } from '../constants/colors';

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
  const { setPhase, setResult, setError } = useScanStore();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (photoUri: string) => {
      abortRef.current = new AbortController();
      setPhase('uploading');
      const result = await analyzeProduct(photoUri, abortRef.current.signal);
      setPhase('analyzing');
      return result;
    },
    onSuccess: async ({ response, savedImageUri }) => {
      const id = generateId();
      const score = computeProductScore(response);
      const riskLevel = toStoredRiskLevel(score);
      const now = new Date().toISOString();

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

      setResult({
        id,
        type: 'product',
        name: response.ProductName,
        imageUri: savedImageUri,
        overallScore: score,
        response,
        analyzedAt: now,
      });

      router.replace(`/result/${id}`);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    analyze: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useRoomAnalysis() {
  const { setPhase, setResult, setError } = useScanStore();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (photoUri: string) => {
      abortRef.current = new AbortController();
      setPhase('uploading');
      const result = await analyzeRoom(photoUri, abortRef.current.signal);
      setPhase('analyzing');
      return result;
    },
    onSuccess: async ({ response, savedImageUri }) => {
      const id = generateId();
      const score = computeRoomScore(response);
      const riskLevel = toStoredRiskLevel(score);
      const now = new Date().toISOString();

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

      setResult({
        id,
        type: 'room',
        name: response.roomType,
        imageUri: savedImageUri,
        overallScore: score,
        response,
        analyzedAt: now,
      });

      router.replace(`/result/${id}`);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return {
    analyze: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
