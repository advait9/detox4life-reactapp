import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { CaptureButton } from '../../components/camera/CaptureButton';
import { FlashToggle } from '../../components/camera/FlashToggle';
import { CameraOverlay } from '../../components/camera/CameraOverlay';
import { useCamera } from '../../hooks/useCamera';
import { useRoomAnalysis } from '../../hooks/useAnalysis';
import { useCameraStore } from '../../stores/useCameraStore';
import { Colors } from '../../constants/colors';
import type { RoomType } from '../../types';

const ROOM_TYPES: RoomType[] = [
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Living',
  'Office',
  'Others',
];

export default function RoomScanScreen() {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { cameraRef, flashMode, facing, cycleFlash, toggleFacing, takePhoto } = useCamera();
  const { analyze } = useRoomAnalysis();
  const [isCapturing, setIsCapturing] = useState(false);
  const { roomType, setRoomType } = useCameraStore();

  const device = useCameraDevice(facing);

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const uri = await takePhoto();
      if (uri) {
        await analyze(uri); // saves image + navigates back internally
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!hasPermission) {
    return (
      <View style={[styles.permissionScreen, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionDesc}>
          Detox 4 Life needs camera access to scan rooms for chemical hazards.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
        photoQualityBalance="speed"
      />

      <CameraOverlay mode="room" />

      {/* Room type selector — top */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomPills}
        >
          {ROOM_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setRoomType(type)}
              style={[
                styles.roomPill,
                roomType === type && styles.roomPillActive,
              ]}
            >
              <Text
                style={[
                  styles.roomPillText,
                  roomType === type && styles.roomPillTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.topRight}>
          <FlashToggle mode={flashMode} onToggle={cycleFlash} />
          <TouchableOpacity onPress={toggleFacing} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <CaptureButton onPress={handleCapture} disabled={isCapturing} />
      </View>

      {isCapturing && (
        <View style={styles.captureOverlay}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  roomPills: { gap: 6, paddingHorizontal: 4 },
  roomPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roomPillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  roomPillText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  roomPillTextActive: { color: '#fff', fontWeight: '700' },
  topRight: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionScreen: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', padding: 32, gap: 16 },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  permissionDesc: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  permissionBtn: { backgroundColor: Colors.brand.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, marginTop: 8 },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { paddingVertical: 12 },
  cancelBtnText: { color: Colors.text.secondary, fontSize: 15 },
});
