// Mirrors DataCircles CRM web app's mobile design tokens (frontend/src/index.css)
export const colors = {
  primary: '#2776EA',
  primaryHover: '#1F63C8',
  gradientStart: '#7E7AE8',
  gradientMid: '#0033FF',
  chromeBg: '#EBEDFF',
  bg: '#F7F8FC',
  card: '#FFFFFF',
  border: '#E5E7F5',
  text: '#111827',
  textMuted: '#6B7280',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  pendingBg: '#EFF3FF',
  pendingText: '#2776EA',
};

export const radius = {
  card: 16,
  pill: 999,
  sm: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const font = {
  family: undefined, // system default (Inter not bundled on-device by default)
  weightMedium: '500' as const,
  weightSemibold: '600' as const,
  weightBold: '700' as const,
};
