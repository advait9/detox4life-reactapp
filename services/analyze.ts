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
  photoUri: string
): Promise<AnalyzeProductResult> {
  // Save full-res image locally for library thumbnail before compression
  const savedImageUri = await saveImageToDocuments(photoUri);

  // Process image (resize, compress) for upload
  const processed = await processImageForUpload(photoUri);

  // Build multipart form data using compressed image
  const formData = buildFormData(processed.uri);

  const response = await api.post<ProductAnalysisResponse>(
    API_ENDPOINTS.analyzeProduct,
    formData
  );

  return {
    response: response.data,
    savedImageUri,
  };
}

export async function analyzeRoom(
  photoUri: string
): Promise<AnalyzeRoomResult> {
  // Save full-res image locally for library thumbnail before compression
  const savedImageUri = await saveImageToDocuments(photoUri);

  // Process image (resize, compress) for upload
  const processed = await processImageForUpload(photoUri);

  // Build multipart form data using compressed image
  const formData = buildFormData(processed.uri);

  const response = await api.post<RoomAnalysisResponse>(
    API_ENDPOINTS.analyzeRoom,
    formData
  );

  return {
    response: response.data,
    savedImageUri,
  };
}
