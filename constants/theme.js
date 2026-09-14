export const theme = {
  colors: {
    primary: '#8B5E3C',
    primarySoft: '#F3E2D0',
    secondary: '#E8A33D',
    secondarySoft: '#F9E7BB',
    background: '#FFF8ED',
    neutral: '#FFF8ED',
    card: '#FFFFFF',
    darkAccent: '#3E2723',
    success: '#6B8E4E',
    successSoft: '#E6F0DB',
    danger: '#C1440E',
    dangerSoft: '#F7DCD0',
    textPrimary: '#3E2723',
    textSecondary: '#8D6E63',
    border: '#E7D7CA',
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
      shadowColor: '#3E2723',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    soft: {
      shadowColor: '#3E2723',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 3,
    },
  },
  typography: {
    headline: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.8,
      color: '#3E2723',
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: '#3E2723',
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#8D6E63',
    },
    body: {
      fontSize: 14,
      fontWeight: '500',
      color: '#3E2723',
    },
    caption: {
      fontSize: 12,
      fontWeight: '600',
      color: '#8D6E63',
    },
  },
};

export default theme;
