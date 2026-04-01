import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { IMAGE_CONFIG } from '../constants/config';

export interface ProcessedImage {
  uri: string;
  base64: string;
  width: number;
  height: number;
  sizeBytes: number;
}

function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) =>
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject)
  );
}

export async function processImageForUpload(
  uri: string
): Promise<ProcessedImage> {
  // Get dimensions without decoding the full image
  const { width: originalWidth, height: originalHeight } = await getImageDimensions(uri);

  // Calculate resize dimensions maintaining aspect ratio
  const longestEdge = Math.max(originalWidth, originalHeight);
  const scale =
    longestEdge > IMAGE_CONFIG.maxLongEdge
      ? IMAGE_CONFIG.maxLongEdge / longestEdge
      : 1;

  const targetWidth = Math.round(originalWidth * scale);
  const targetHeight = Math.round(originalHeight * scale);

  const actions: ImageManipulator.Action[] =
    scale < 1 ? [{ resize: { width: targetWidth, height: targetHeight } }] : [];

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: IMAGE_CONFIG.quality,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Failed to convert image to base64');
  }

  const sizeBytes = Math.round((result.base64.length * 3) / 4);

  if (sizeBytes > IMAGE_CONFIG.maxSizeBytes) {
    const recompressed = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    if (!recompressed.base64) throw new Error('Failed to recompress image');
    return {
      uri: recompressed.uri,
      base64: recompressed.base64,
      width: targetWidth,
      height: targetHeight,
      sizeBytes: Math.round((recompressed.base64.length * 3) / 4),
    };
  }

  return {
    uri: result.uri,
    base64: result.base64,
    width: targetWidth,
    height: targetHeight,
    sizeBytes,
  };
}

export async function saveImageToDocuments(uri: string): Promise<string> {
  const documentsDir = FileSystem.documentDirectory;
  if (!documentsDir) throw new Error('Documents directory not available');

  const filename = `scan_${Date.now()}.jpg`;
  const destination = `${documentsDir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

export function buildFormData(imageUri: string): FormData {
  const formData = new FormData();
  const filename = `scan_${Date.now()}.jpg`;

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: 'image/jpeg',
  } as any);

  return formData;
}
