import { create } from 'zustand';
import type { FlashMode, CameraFacing, ScanMode, RoomType } from '../types';

interface CameraState {
  flashMode: FlashMode;
  facing: CameraFacing;
  scanMode: ScanMode;
  roomType: RoomType;

  setFlashMode: (mode: FlashMode) => void;
  toggleFacing: () => void;
  setScanMode: (mode: ScanMode) => void;
  setRoomType: (type: RoomType) => void;
  reset: () => void;
}

const initialState = {
  flashMode: 'auto' as FlashMode,
  facing: 'back' as CameraFacing,
  scanMode: 'product' as ScanMode,
  roomType: 'Kitchen' as RoomType,
};

export const useCameraStore = create<CameraState>((set) => ({
  ...initialState,

  setFlashMode: (mode) => set({ flashMode: mode }),

  toggleFacing: () =>
    set((state) => ({
      facing: state.facing === 'back' ? 'front' : 'back',
    })),

  setScanMode: (mode) => set({ scanMode: mode }),

  setRoomType: (type) => set({ roomType: type }),

  reset: () => set(initialState),
}));
