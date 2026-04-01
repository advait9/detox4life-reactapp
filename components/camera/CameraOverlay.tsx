import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { ScanMode } from '../../types';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CameraOverlayProps {
  mode: ScanMode;
}

export function CameraOverlay({ mode }: CameraOverlayProps) {
  if (mode === 'product') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Guide rectangle */}
        <View style={styles.productGuideContainer}>
          <View style={styles.productGuide}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>
    );
  }

  // Room mode: subtle grid
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.gridContainer}>
        {/* Horizontal lines */}
        <View style={[styles.gridLine, styles.gridLineH, { top: '33%' }]} />
        <View style={[styles.gridLine, styles.gridLineH, { top: '66%' }]} />
        {/* Vertical lines */}
        <View style={[styles.gridLine, styles.gridLineV, { left: '33%' }]} />
        <View style={[styles.gridLine, styles.gridLineV, { left: '66%' }]} />
      </View>
    </View>
  );
}

const GUIDE_WIDTH = SCREEN_WIDTH * 0.78;
const GUIDE_HEIGHT = GUIDE_WIDTH * 0.6;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  productGuideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  productGuide: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#fff',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gridContainer: { flex: 1 },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.2)' },
  gridLineH: { left: 0, right: 0, height: 1 },
  gridLineV: { top: 0, bottom: 0, width: 1 },
});
