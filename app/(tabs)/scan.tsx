import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export default function ScanTab() {
  const [sheetVisible, setSheetVisible] = useState(true);
  const insets = useSafeAreaInsets();

  const handleSelect = (mode: 'product' | 'room') => {
    setSheetVisible(false);
    setTimeout(() => {
      if (mode === 'product') {
        router.push('/scan/product');
      } else {
        router.push('/scan/room');
      }
    }, 150);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSheetVisible(false);
          router.back();
        }}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            setSheetVisible(false);
            router.back();
          }}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Choose Scan Type</Text>
          <Text style={styles.sheetSubtitle}>
            What would you like to analyze?
          </Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelect('product')}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>📦</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Analyze Product</Text>
              <Text style={styles.optionDesc}>
                Scan a product label or ingredient list
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelect('room')}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>🏠</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Analyze Room</Text>
              <Text style={styles.optionDesc}>
                Scan a room to find potential chemical hazards
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ui.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: { fontSize: 26 },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  optionDesc: { fontSize: 13, color: Colors.text.secondary, lineHeight: 18 },
  optionArrow: { fontSize: 22, color: Colors.text.secondary, fontWeight: '300' },
});

// NOTE: must also be exported in app/(tabs)/_layout so the tab exists
// but we need the modal to appear on tab press. Add a `listeners` prop to
// the tab to show the modal.
