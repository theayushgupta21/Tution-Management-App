import { Platform } from 'react-native';

const tintColorLight = '#E77A42';
const tintColorDark = '#FFF7F0';

export const Colors = {
  light: {
    text: '#2A1F1B',
    background: '#FFF8ED',
    tint: tintColorLight,
    icon: '#7E665C',
    tabIconDefault: '#9B867D',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F7F1EB',
    background: '#1F1715',
    tint: tintColorDark,
    icon: '#E5D6C9',
    tabIconDefault: '#C7B3A7',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'SF Pro Rounded',
    mono: 'SFMono-Regular',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Poppins', 'Nunito', 'Segoe UI', sans-serif",
    serif: "'Georgia', serif",
    rounded: "'Nunito', 'Poppins', 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', 'Consolas', monospace",
  },
});

export const theme = {
  colors: {
    primary: '#E77A42',
    primaryStrong: '#D66329',
    primarySoft: '#FDE7DB',
    secondary: '#6DB0A5',
    secondarySoft: '#E4F5F0',
    tertiary: '#F5BF5E',
    tertiarySoft: '#FFF2CC',
    info: '#8EB9E8',
    infoSoft: '#EAF3FF',
    success: '#73A86C',
    successSoft: '#EAF5E8',
    warning: '#E8B15A',
    warningSoft: '#FFF2D9',
    danger: '#D96B5B',
    dangerSoft: '#FDE5E0',
    background: '#FFF8ED',
    backgroundAlt: '#F9F3EA',
    neutral: '#FFF8ED',
    card: '#FFFFFF',
    cardMuted: '#F7F1EA',
    darkAccent: '#2F221F',
    textPrimary: '#2F221F',
    textSecondary: '#7B655D',
    textMuted: '#A48D7F',
    border: '#F0E2D7',
    borderStrong: '#E4C9B3',
    white: '#FFFFFF',
    shadow: '#2F221F',
    overlay: 'rgba(47, 34, 31, 0.12)',
  },
  spacing: {
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 36,
  },
  radii: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    full: 999,
  },
  shadows: {
    card: {
      shadowColor: '#2F221F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    soft: {
      shadowColor: '#2F221F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 18,
      elevation: 4,
    },
    strong: {
      shadowColor: '#2F221F',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 7,
    },
  },
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -1,
      color: '#2F221F',
    },
    headline: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.8,
      color: '#2F221F',
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: '#2F221F',
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '700',
      color: '#7B655D',
    },
    body: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2F221F',
    },
    bodyStrong: {
      fontSize: 15,
      fontWeight: '700',
      color: '#2F221F',
    },
    caption: {
      fontSize: 12,
      fontWeight: '700',
      color: '#7B655D',
    },
    small: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
      color: '#7B655D',
    },
  },
};

export default theme;
