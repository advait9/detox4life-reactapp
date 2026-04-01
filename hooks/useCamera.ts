import { useRef, useCallback } from 'react';
import { Camera } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';
import { useCameraStore } from '../stores/useCameraStore';
import { useScanStore } from '../stores/useScanStore';

export function useCamera() {
  const cameraRef = useRef<Camera>(null);
  const { flashMode, facing, toggleFacing, setFlashMode } = useCameraStore();
  const { setPhase, setCapturedImage } = useScanStore();

  const cycleFlash = useCallback(() => {
    const next: Record<string, 'auto' | 'on' | 'off'> = {
      auto: 'on',
      on: 'off',
      off: 'auto',
    };
    setFlashMode(next[flashMode] ?? 'auto');
  }, [flashMode, setFlashMode]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current) return null;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhase('capturing');

      const photo = await cameraRef.current.takePhoto({
        flash: flashMode,
      });

      const uri = `file://${photo.path}`;
      setCapturedImage(uri);
      return uri;
    } catch (error) {
      setPhase('error');
      return null;
    }
  }, [flashMode, setPhase, setCapturedImage]);

  return {
    cameraRef,
    flashMode,
    facing,
    cycleFlash,
    toggleFacing,
    takePhoto,
  };
}
