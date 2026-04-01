import api from './api';
import { processImageForUpload, saveImageToDocuments, buildFormData } from './image';
import { API_ENDPOINTS } from '../constants/config';
import type { ProductAnalysisResponse, RoomAnalysisResponse } from '../types';

export interface AnalyzeProductResult {
  response: ProductAnalysisResponse;
  savedImageUri: string;
}

export interface AnalyzeRoomResult {
  response: RoomAnalysisResponse;
  savedImageUri: string;
}

export async function analyzeProduct(
  photoUri: string,
  signal?: AbortSignal
): Promise<AnalyzeProductResult> {
  // Save full-res + process for upload in parallel
  const [savedImageUri, processed] = await Promise.all([
    saveImageToDocuments(photoUri),
    processImageForUpload(photoUri),
  ]);

  const formData = buildFormData(processed.uri);

  const response = await api.post<ProductAnalysisResponse>(
    API_ENDPOINTS.analyzeProduct,
    formData,
    { signal }
  );

  return {
    response: response.data,
    savedImageUri,
  };
}

export async function analyzeRoom(
  photoUri: string,
  signal?: AbortSignal
): Promise<AnalyzeRoomResult> {
  // Save full-res + process for upload in parallel
  const [savedImageUri, processed] = await Promise.all([
    saveImageToDocuments(photoUri),
    processImageForUpload(photoUri),
  ]);

  const formData = buildFormData(processed.uri);

  const response = await api.post<RoomAnalysisResponse>(
    API_ENDPOINTS.analyzeRoom,
    formData,
    { signal }
  );

  return {
    response: response.data,
    savedImageUri,
  };
}
