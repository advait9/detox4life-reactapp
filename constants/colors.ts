export const Colors = {
  brand: {
    primary: '#2D6A4F',
    dark: '#1B4332',
    light: '#D8F3DC',
    accent: '#52B788',
  },
  risk: {
    safe: '#40916C',
    low: '#95D5B2',
    moderate: '#F4A261',
    high: '#E76F51',
    critical: '#D62828',
  },
  bg: {
    primary: '#FFFFFF',
    secondary: '#F8FAF9',
    dark: '#0D1B16',
    darkCard: '#162B22',
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#6C757D',
    light: '#E8F5E9',
  },
  ui: {
    border: '#E8F5E9',
    divider: '#F0F0F0',
    overlay: 'rgba(0,0,0,0.4)',
    shadow: 'rgba(0,0,0,0.08)',
  },
} as const;

export type RiskLevelColor = keyof typeof Colors.risk;

export function getRiskColor(risk: 'safe' | 'low' | 'moderate' | 'high' | 'critical'): string {
  return Colors.risk[risk];
}

export function getScoreColor(score: number): string {
  if (score <= 3) return Colors.risk.safe;
  if (score <= 5) return Colors.risk.low;
  if (score <= 7) return Colors.risk.moderate;
  if (score <= 9) return Colors.risk.high;
  return Colors.risk.critical;
}

export function getRiskLevelFromScore(score: number): 'safe' | 'low' | 'moderate' | 'high' | 'critical' {
  if (score <= 3) return 'safe';
  if (score <= 5) return 'low';
  if (score <= 7) return 'moderate';
  if (score <= 9) return 'high';
  return 'critical';
}

export function getRiskLevelFromApiRisk(risk: 'low' | 'medium' | 'high'): 'safe' | 'low' | 'moderate' | 'high' | 'critical' {
  if (risk === 'low') return 'low';
  if (risk === 'medium') return 'moderate';
  return 'high';
}
