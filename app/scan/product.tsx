import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { useProductAnalysis } from '../../hooks/useAnalysis';
import { useScanStore } from '../../stores/useScanStore';
import { Colors } from '../../constants/colors';

export default function ProductScanScreen() {
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { cameraRef, flashMode, facing, cycleFlash, toggleFacing, takePhoto } = useCamera();
  const { analyze, isLoading } = useProductAnalysis();
  const { phase, error, reset } = useScanStore();

  const device = useCameraDevice(facing);

  const handleCapture = async () => {
    const uri = await takePhoto();
    if (uri) {
      analyze(uri);
    }
  };

  const handleClose = () => {
    reset();
    router.back();
  };

  // Permission not granted
  if (!hasPermission) {
    return (
      <View style={[styles.permissionScreen, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionDesc}>
          Detox 4 Life needs camera access to scan product labels.
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
        isActive={phase === 'idle' || phase === 'capturing'}
        photo
        photoQualityBalance="quality"
      />

      <CameraOverlay mode="product" />

      {/* Top controls */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modeLabel}>Product Scan</Text>
        <View style={styles.topRight}>
          <FlashToggle mode={flashMode} onToggle={cycleFlash} />
          <TouchableOpacity onPress={toggleFacing} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⟳</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        {error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => reset()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CaptureButton onPress={handleCapture} disabled={isLoading} />
        )}
      </View>

      {/* Full-screen analysis overlay */}
      {isLoading && (
        <View style={styles.analysisOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.analysisTitle}>
            {phase === 'uploading' ? 'Uploading…' : 'Analysing product…'}
          </Text>
          <Text style={styles.analysisSubtitle}>This may take a few seconds</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  modeLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  topRight: { flexDirection: 'row', gap: 8 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
  },
  analyzingState: { alignItems: 'center', gap: 12 },
  analyzingText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  errorState: { alignItems: 'center', gap: 12 },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(214,40,40,0.75)',
    padding: 12,
    borderRadius: 10,
  },
  retryBtn: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  analysisOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  analysisTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  analysisSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  permissionScreen: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', padding: 32, gap: 16 },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  permissionDesc: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  permissionBtn: { backgroundColor: Colors.brand.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24, marginTop: 8 },
  permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { paddingVertical: 12 },
  cancelBtnText: { color: Colors.text.secondary, fontSize: 15 },
});
