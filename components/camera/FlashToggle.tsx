import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { FlashMode } from '../../types';

interface FlashToggleProps {
  mode: FlashMode;
  onToggle: () => void;
}

const FLASH_ICONS: Record<FlashMode, string> = {
  auto: '⚡A',
  on: '⚡',
  off: '⚡✕',
};

export function FlashToggle({ mode, onToggle }: FlashToggleProps) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.btn} activeOpacity={0.7}>
      <Text style={styles.icon}>{FLASH_ICONS[mode]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 14, color: '#fff', fontWeight: '700' },
});
