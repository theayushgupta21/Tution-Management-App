/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const theme = {
  colors: {
    primary: '#8B5E3C',
    primarySoft: '#F4E3D2',
    secondary: '#E8A33D',
    secondarySoft: '#FDF0D8',
    background: '#FFF8ED',
    neutral: '#FFF8ED',
    card: '#FFFFFF',
    darkAccent: '#3E2723',
    success: '#6B8E4E',
    successSoft: '#E7F0DD',
    danger: '#C1440E',
    dangerSoft: '#FCE1D3',
    textPrimary: '#3E2723',
    textSecondary: '#8D6E63',
    border: '#EADCCB',
    white: '#FFFFFF',
    shadow: '#3E2723',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    full: 999,
  },
  shadows: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    soft: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
  },
  typography: {
    headline: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.8,
      color: '#1a1a1a',
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: '#1a1a1a',
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#6b7280',
    },
    body: {
      fontSize: 14,
      fontWeight: '500',
      color: '#1a1a1a',
    },
    caption: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6b7280',
    },
  },
};

export default theme;
