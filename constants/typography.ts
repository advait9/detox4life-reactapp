import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  overline: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 24,
  full: 9999,
} as const;
